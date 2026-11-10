// simulation store for chat and state management
import { reactive, computed } from 'vue'
import { Notify, AppVisibility } from 'quasar'
import { getStoredToken, setStoredToken, apiGet, apiPost, apiPatch, apiDelete } from '@/services/api'

export type Status = 'online' | 'dnd' | 'offline'
export interface User { id: number; firstName: string; lastName: string; nickName: string; email: string; password?: string; status: Status }
export interface Channel { id: number; name: string; type: 'public' | 'private'; adminId: number; createdAt: number; lastActivityAt: number; members: number[]; banned: number[]; kickVotes: Record<number, number[]> }
export interface Message { id: number; channelId: number; authorId: number; text: string; createdAt: number; mentions: number[] }
export interface Invite { channelId: number; userId: number }
export interface Result { ok: boolean; message: string; goTo?: number | undefined }

export const COMMANDS = [
  { cmd: '/join', usage: '/join channelName [private]', desc: 'Pripojí sa ku kanálu, ak neexistuje, vytvorí ho' },
  { cmd: '/invite', usage: '/invite nickName', desc: 'Pozve používateľa (alebo obnoví prístup po bane – správca)' },
  { cmd: '/revoke', usage: '/revoke nickName', desc: 'Odoberie používateľa zo súkromného kanála (správca)' },
  { cmd: '/kick', usage: '/kick nickName', desc: 'Vyhodí člena z verejného kanála (3 hlasy = ban, správca = ban hneď)' },
  { cmd: '/list', usage: '/list', desc: 'Zobrazí zoznam členov kanála' },
  { cmd: '/cancel', usage: '/cancel', desc: 'Opustí kanál (ak ste správca, kanál zaniká)' },
  { cmd: '/quit', usage: '/quit', desc: 'Zruší kanál (správca)' },
]

const DAY = 86_400_000 //, MIN = 60_000, t0 = Date.now()
export const EXPIRE_DAYS = 30

const unread: Record<number, number> = {}
const typing: Record<number, Record<number, string>> = {}
const state = reactive({
  users: [
    { id: 1, firstName: 'Jana', lastName: 'Nováková', nickName: 'jana', email: 'jana@flack.sk', password: '1234', status: 'online' },
    { id: 2, firstName: 'Eduard', lastName: 'Kováč', nickName: 'ed', email: 'ed@flack.sk', password: '1234', status: 'online' },
    { id: 3, firstName: 'Mia', lastName: 'Horváthová', nickName: 'mia', email: 'mia@flack.sk', password: '1234', status: 'dnd' },
    { id: 4, firstName: 'Tomáš', lastName: 'Šimko', nickName: 'tom', email: 'tom@flack.sk', password: '1234', status: 'offline' },
  ] as User[],
  channels: [] as Channel[],
  messages: [] as Message[],
  invites: [] as Invite[],
  pending: [] as Message[],
  unread: unread,
  typing: typing,
  currentUserId: null as number | null,
  activeChannelId: null as number | null,
  mentionsOnly: false,
})
export const ui = reactive({ membersDialog: false, settingsDialog: false, liveUserId: null as number | null })

let seq = 1000
const nextId = () => ++seq
// const mkCh = (id: number, name: string, type: 'public' | 'private', adminId: number, members: number[], last = t0): Channel =>
//   ({ id, name, type, adminId, createdAt: last - 40 * DAY, lastActivityAt: last, members, banned: [], kickVotes: {} })

const phrases = 
 ['Adamko si génius feugiat nulla. In tincidunt, est nec blandit sollicitudin, mauris diam congue felis, quis pharetra diam urna ac nibh. Vivamus vestibulum, ', 
  'VPWA je skvelý predmet eu augue elit. Nullam bibendum magna ac erat facilisis, non feugiat quam iaculis. Nunc sem enim, mattis non lacus efficitur, venenatis ', 
  'pushol som github sed gravida leo. Phasellus ultricies justo et lorem egestas, at malesuada mi ornare. Pellentesque tempus nisi mi. Proin vel lectus nibh. ', 
  'niekto eat? sollicitudin, et hendrerit risus dignissim. Proin ullamcorper enim at posuere iaculis. Etiam porttitor eros pulvinar elit vehicula, non ']
// function gen(channelId: number, authors: number[], count: number, end = t0) {
//   for (let i = 0; i < count; i++) {
//     const a = authors[i % authors.length]!
//     const mention = i % 15 === 0 && a !== 1
//     state.messages.push({ id: nextId(), channelId, authorId: a, createdAt: end - (count - i) * 37 * MIN,
//       text: `${mention ? '@jana ' : ''}${phrases[(i * 7) % phrases.length]} (#${i + 1})`, mentions: mention ? [1] : [] })
//   }
// }

// helper functions for lookups and result formatting
const byNick = (n: string) => state.users.find((u) => u.nickName.toLowerCase() === n.replace(/^@/, '').toLowerCase())
const userById = (id: number) => state.users.find((u) => u.id === id)
const ok = (message: string, goTo?: number): Result => ({ ok: true, message, goTo })
const fail = (message: string): Result => ({ ok: false, message })
const me = computed(() => state.users.find((u) => u.id === state.currentUserId) ?? null)
const activeChannel = computed(() => {
  if (!state.activeChannelId) return null
  const c = state.channels.find((x) => x.id === state.activeChannelId)
  return c && me.value && (c.members || []).includes(me.value.id) ? c : null
})
const isAdmin = (c: Channel) => c.adminId === me.value?.id

// sidebar channels and computed lists
const sidebarChannels = computed(() => {
  if (!me.value) return []
  const inv = state.invites.filter((i) => i.userId === me.value!.id)
    .map((i) => ({ channel: state.channels.find((c) => c.id === i.channelId)!, invited: true })).filter((x) => x.channel)
  const mem = state.channels.filter((c) => (c.members || []).includes(me.value!.id))
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt).map((channel) => ({ channel, invited: false }))
  return [...inv, ...mem]
})
const discoverable = computed(() => !me.value ? [] : state.channels.filter((c) => c.type === 'public' && !(c.members || []).includes(me.value!.id)
  && !(c.banned || []).includes(me.value!.id) && !state.invites.some((i) => i.userId === me.value!.id && i.channelId === c.id)))
const typingUsers = computed(() => {
  const c = activeChannel.value
  if (!c || !me.value || me.value.status === 'offline') return []
  return Object.entries(state.typing[c.id] ?? {}).filter(([id]) => +id !== me.value!.id)
    .map(([id, draft]) => ({ user: userById(+id)!, draft }))
})
const channelMessages = (id: number) => state.messages.filter((m) => m.channelId === id).sort((a, b) => a.createdAt - b.createdAt)
const daysLeft = (c: Channel) => EXPIRE_DAYS - Math.floor((Date.now() - c.lastActivityAt) / DAY)

// registers new user via backend api and updates state
async function register(d: { firstName: string; lastName: string; nickName: string; email: string; password: string }): Promise<Result> {
  try {
    const raw = await apiPost<{ user?: User; token?: string; data?: { user?: User; token?: string } }>('/auth/signup', d)
    const user = raw?.user ?? raw?.data?.user
    const token = raw?.token ?? raw?.data?.token
    if (!user || !token) {
      return fail('registracia zlyhala')
    }
    setStoredToken(token)
    const existingIndex = state.users.findIndex((u) => u.id === user.id)
    if (existingIndex >= 0) {
      state.users[existingIndex] = user
    } else {
      state.users.push(user)
    }
    state.currentUserId = user.id
    await setStatus('online')
    await fetchChannels()
    return ok(`Vitaj, ${user.firstName}!`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'registracia zlyhala'
    return fail(message)
  }
}

// logs user in via backend api and updates state
async function login(idOrEmail: string, password: string): Promise<Result> {
  try {
    const raw = await apiPost<{ user?: User; token?: string; data?: { user?: User; token?: string } }>('/auth/login', { uid: idOrEmail, password })
    const user = raw?.user ?? raw?.data?.user
    const token = raw?.token ?? raw?.data?.token
    if (!user || !token) {
      return fail('nespravne prihlasovacie udaje')
    }
    setStoredToken(token)
    const existingIndex = state.users.findIndex((u) => u.id === user.id)
    if (existingIndex >= 0) {
      state.users[existingIndex] = user
    } else {
      state.users.push(user)
    }
    state.currentUserId = user.id
    await setStatus('online')
    await fetchChannels()
    return ok(`Vitaj spat, ${user.firstName}!`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'nespravne prihlasovacie udaje'
    return fail(message)
  }
}

// logs user out and removes stored token
async function logout(): Promise<void> {
  try {
    if (getStoredToken()) {
      await apiPost('/account/logout')
    }
  } catch {
    // ignores backend error on logout
  } finally {
    setStoredToken(null)
    state.currentUserId = null
    state.activeChannelId = null
    state.channels = []
    state.invites = []
  }
}

// fetches current authenticated user from backend profile endpoint
async function loadCurrentUser(): Promise<void> {
  if (!getStoredToken()) return
  try {
    const raw = await apiGet<User | { data: User }>('/account/profile')
    const user = (raw && typeof raw === 'object' && 'data' in raw && (raw).data) ? (raw).data : (raw as User)
    if (!user || !user.id) return
    const existingIndex = state.users.findIndex((u) => u.id === user.id)
    if (existingIndex >= 0) {
      state.users[existingIndex] = user
    } else {
      state.users.push(user)
    }
    state.currentUserId = user.id
  } catch {
    setStoredToken(null)
    state.currentUserId = null
  }
}

// fetches all users from backend database for mentions and member lists
async function fetchUsers(): Promise<void> {
  try {
    const raw = await apiGet<User[] | { data: User[] }>('/users')
    const users = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw).data) ? (raw).data : [])
    if (Array.isArray(users)) {
      users.forEach((u) => {
        const idx = state.users.findIndex((existing) => existing.id === u.id)
        if (idx >= 0) {
          state.users[idx] = u
        } else {
          state.users.push(u)
        }
      })
    }
  } catch {
    // silently fallback to initial users if offline
  }
}

// fetches channels and invites from backend database
async function fetchChannels(): Promise<void> {
  if (!getStoredToken()) return
  try {
    const data = await apiGet<{
      myChannels?: Channel[]
      inviteChannels?: Channel[]
      invites?: Invite[]
      discoverable?: Channel[]
    }>('/channels')

    const myChannels = data?.myChannels ?? []
    const inviteChannels = data?.inviteChannels ?? []
    const discoverableChannels = data?.discoverable ?? []
    const invites = data?.invites ?? []

    const allChannels = [...myChannels, ...inviteChannels, ...discoverableChannels]
    allChannels.forEach((ch) => {
      const idx = state.channels.findIndex((c) => c.id === ch.id)
      if (idx >= 0) {
        state.channels[idx] = ch
      } else {
        state.channels.push(ch)
      }
    })

    state.invites = invites
  } catch {
    // silently fallback to local channels if offline
  }
}

// sets user status and syncs with backend
async function setStatus(s: Status) {
  if (!me.value) return
  me.value.status = s
  if (getStoredToken()) {
    void apiPatch('/account/status', { status: s }).catch(() => {})
  }
  if (s === 'online') {
    // auto-aktualizacia kanalov po navrate do online
    await fetchChannels()
    if (state.pending.length) {
      const n = state.pending.length
      state.pending.splice(0).forEach((m) => addIncoming(m, true))
      Notify.create({ type: 'info', message: `Kanály aktualizované – ${n} nových správ` })
    }
  }
}

// channel management helpers
function removeMember(c: Channel, id: number) {
  c.members = c.members.filter((m) => m !== id)
  delete c.kickVotes[id]
}

function deleteChannel(id: number) {
  state.channels = state.channels.filter((c) => c.id !== id)
  state.messages = state.messages.filter((m) => m.channelId !== id)
  state.invites = state.invites.filter((i) => i.channelId !== id)
  delete state.typing[id]
  delete state.unread[id]
  if (state.activeChannelId === id) {
    state.activeChannelId = null
  }
}

// prunes inactive channels via backend api and locally
async function pruneInactive(): Promise<void> {
  if (getStoredToken()) {
    await apiDelete('/channels/prune').catch(() => {})
  }
  state.channels.filter((c) => daysLeft(c) <= 0).forEach((c) => deleteChannel(c.id))
}

// joins existing channel or creates a new one via backend api
async function join(name: string, priv: boolean): Promise<Result> {
  const u = me.value
  if (!u) return fail('Najprv sa prihláste.')
  if (!/^[\w-]{2,24}$/.test(name)) return fail('Neplatný názov kanála (2–24 znakov: písmená, čísla, -, _).')

  try {
    const ch = await apiPost<Channel>('/channels', {
      name,
      type: priv ? 'private' : 'public',
    })

    const idx = state.channels.findIndex((c) => c.id === ch.id)
    if (idx >= 0) {
      state.channels[idx] = ch
    } else {
      state.channels.push(ch)
    }

    state.invites = state.invites.filter((i) => i.channelId !== ch.id)
    return ok(`Pripojené do #${ch.name} (${ch.type === 'private' ? 'súkromný' : 'verejný'}).`, ch.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'chyba pri vstupe do kanala'
    return fail(msg)
  }
}

// accepts channel invitation via backend api
async function acceptInvite(id: number): Promise<Result> {
  try {
    const ch = await apiPost<Channel>(`/channels/${id}/accept-invite`)
    const idx = state.channels.findIndex((c) => c.id === ch.id)
    if (idx >= 0) {
      state.channels[idx] = ch
    } else {
      state.channels.push(ch)
    }
    state.invites = state.invites.filter((i) => i.channelId !== id)
    return ok(`Pripojili ste sa do #${ch.name}.`, ch.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'chyba pri prijati pozvanky'
    return fail(msg)
  }
}

// declines channel invitation via backend api
async function declineInvite(id: number): Promise<void> {
  try {
    await apiDelete(`/channels/${id}/decline-invite`)
  } catch {
    // ignores decline invite error
  } finally {
    state.invites = state.invites.filter((i) => !(i.channelId === id && i.userId === me.value?.id))
  }
}

// leaves channel or deletes it if user is admin
async function cancelMembership(id: number): Promise<Result> {
  const c = state.channels.find((x) => x.id === id)
  if (!c || !me.value) return fail('Kanál neexistuje.')
  try {
    const res = await apiDelete<{ message: string; deleted?: boolean }>(`/channels/${id}/leave`)
    if (res?.deleted) {
      deleteChannel(id)
      return ok(`Správca opustil #${c.name} – kanál zanikol.`)
    }
    removeMember(c, me.value.id)
    return ok(`Opustili ste #${c.name}.`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'chyba pri opusteni kanala'
    return fail(msg)
  }
}

// deletes channel completely by admin
async function quitChannel(id: number): Promise<Result> {
  const c = state.channels.find((x) => x.id === id)
  if (!c || !isAdmin(c)) return fail('Kanál môže zrušiť iba správca.')
  try {
    await apiDelete(`/channels/${id}`)
    deleteChannel(id)
    return ok(`Kanál #${c.name} bol zrušený.`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'chyba pri ruseni kanala'
    return fail(msg)
  }
}

// parses and executes user command or sends message
async function execute(raw: string): Promise<Result> {
  const text = raw.trim()
  if (!text) return fail('Prázdna správa.')
  if (!me.value) return fail('Najprv sa prihláste.')
  if (!text.startsWith('/')) return sendMessage(text)
  const [cmd, a1, a2] = text.split(/\s+/)
  const c = activeChannel.value
  const u = me.value
  const needCh = () => (c ? null : fail('Príkaz funguje iba v otvorenom kanáli.'))
  const target = () => (a1 ? byNick(a1) : undefined)

  switch (cmd!.toLowerCase()) {
    case '/join':
      return a1 ? await join(a1, a2?.toLowerCase() === 'private') : fail('Použitie: /join channelName [private]')
    case '/list':
      if (needCh()) return needCh()!
      ui.membersDialog = true
      return ok('')
    case '/cancel':
      return needCh() ?? (await cancelMembership(c!.id))
    case '/quit':
      return needCh() ?? (await quitChannel(c!.id))
    case '/invite': {
      if (needCh()) return needCh()!
      if (!a1) return fail('Použitie: /invite nickName')
      try {
        await apiPost(`/channels/${c!.id}/invite`, { targetNickName: a1 })
        const targetUser = byNick(a1)
        if (targetUser && !state.invites.some((i) => i.userId === targetUser.id && i.channelId === c!.id)) {
          state.invites.push({ channelId: c!.id, userId: targetUser.id })
        }
        return ok(`Pozvánka pre ${a1} odoslaná.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'chyba pri odosielani pozvanky'
        return fail(msg)
      }
    }
    case '/revoke': {
      if (needCh()) return needCh()!
      if (!a1) return fail('Použitie: /revoke nickName')
      const t = target()
      if (!t) return fail(`Používateľ ${a1} neexistuje.`)
      try {
        await apiDelete(`/channels/${c!.id}/members/${t.id}`)
        removeMember(c!, t.id)
        state.invites = state.invites.filter((i) => !(i.userId === t.id && i.channelId === c!.id))
        return ok(`${t.nickName} bol odobraný.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'chyba pri odoberani clena'
        return fail(msg)
      }
    }
    case '/kick': {
      if (needCh()) return needCh()!
      if (!a1) return fail('Použitie: /kick nickName')
      const t = target()
      if (!t) return fail(`Používateľ ${a1} neexistuje.`)
      try {
        const res = await apiPost<{ message: string; banned?: boolean; votes?: number }>(`/channels/${c!.id}/kick`, {
          targetNickName: a1,
        })
        if (res?.banned) {
          removeMember(c!, t.id)
          if (!c!.banned.includes(t.id)) c!.banned.push(t.id)
          return ok(`${t.nickName} má trvalý ban v #${c!.name}.`)
        }
        const votes = (c!.kickVotes[t.id] ??= [])
        if (!votes.includes(u.id)) votes.push(u.id)
        return ok(`Hlas za vyhodenie ${t.nickName}: ${res?.votes ?? votes.length}/3.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'chyba pri hlasovani za kick'
        return fail(msg)
      }
    }
    default:
      return fail(`Neznámy príkaz ${cmd}.`)
  }
}

function sendMessage(text: string): Result {
  const c = activeChannel.value
  if (!c || !me.value) return fail('Správu môžete odoslať iba v kanáli, ktorého ste členom.')
  const mentions = [...text.matchAll(/@(\w+)/g)].map((m) => byNick(m[1]!)?.id).filter((x): x is number => !!x)
  state.messages.push({ id: nextId(), channelId: c.id, authorId: me.value.id, text, createdAt: Date.now(), mentions })
  c.lastActivityAt = Date.now()
  setTyping('')
  return ok('')
}

function setActive(id: number | null) {
  state.activeChannelId = id
  if (id) state.unread[id] = 0
}

function setTyping(draft: string) {
  const c = activeChannel.value
  if (!c || !me.value) return
  const t = (state.typing[c.id] ??= {})
  if (draft && !draft.startsWith('/')) t[me.value.id] = draft
  else delete t[me.value.id]
}

// notification handler helpers
const requestNotifyPermission = () => { if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission(); }
function notify(m: Message) {
  const u = me.value
  if (!u || u.status !== 'online' || AppVisibility.appVisible) return
  const mentioned = m.mentions.includes(u.id)
  if (state.mentionsOnly && !mentioned) return
  const title = `${userById(m.authorId)?.nickName} • #${state.channels.find((c) => c.id === m.channelId)?.name}`
  const body = m.text.length > 80 ? m.text.slice(0, 80) + '…' : m.text
  if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body })
  else Notify.create({ message: title, caption: body, position: 'top-right' })
}

function addIncoming(m: Message, silent = false) {
  const c = state.channels.find((x) => x.id === m.channelId)
  if (!c) return
  state.messages.push(m)
  c.lastActivityAt = m.createdAt
  if (c.id !== state.activeChannelId) state.unread[c.id] = (state.unread[c.id] ?? 0) + 1
  if (!silent) notify(m)
}

// background simulation of chat activity
let started = false
function simulate() {
  const u = me.value
  if (!u) return
  const mine = state.channels.filter((c) => c.members.includes(u.id) && c.members.length > 1)
  const c = (activeChannel.value && Math.random() < 0.6 ? activeChannel.value : mine[Math.floor(Math.random() * mine.length)])
  if (!c) return
  const others = c.members.filter((id) => id !== u.id)
  if (!others.length) return
  const uid = others[Math.floor(Math.random() * others.length)]!
  const text = (Math.random() < 0.4 ? `@${u.nickName} ` : '') + phrases[Math.floor(Math.random() * phrases.length)]
  let i = 0
  const t = (state.typing[c.id] ??= {})
  const timer = setInterval(() => {
    t[uid] = text.slice(0, ++i)
    if (i >= text.length) {
      clearInterval(timer)
      delete t[uid]
      const msg: Message = { id: nextId(), channelId: c.id, authorId: uid, text, createdAt: Date.now(), mentions: text.startsWith('@') ? [u.id] : [] }
      if (me.value?.status === 'offline') state.pending.push(msg)
      else addIncoming(msg)
    }
  }, 90)
}

// initializes chat store and background timers
async function init() {
  if (started) return
  started = true
  await loadCurrentUser()
  await fetchUsers()
  await fetchChannels()
  void pruneInactive()
  setInterval(() => void pruneInactive(), 60_000)
  setInterval(simulate, 15_000)
}

// exports reactive state and functions for components
export function useChat() {
  return {
    state,
    ui,
    me,
    activeChannel,
    sidebarChannels,
    discoverable,
    typingUsers,
    channelMessages,
    userById,
    daysLeft,
    isAdmin,
    register,
    login,
    logout,
    loadCurrentUser,
    fetchUsers,
    fetchChannels,
    setStatus,
    execute,
    acceptInvite,
    declineInvite,
    cancelMembership,
    quitChannel,
    setActive,
    setTyping,
    init,
    requestNotifyPermission,
  }
}
