//1. faza simulacia 
import { reactive, computed } from 'vue';
import { Notify, AppVisibility } from 'quasar';

export type Status = 'online' | 'dnd' | 'offline';
export interface User { id: number; firstName: string; lastName: string; nickName: string; email: string; password: string; status: Status }
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
];

const DAY = 86_400_000, MIN = 60_000, t0 = Date.now();
export const EXPIRE_DAYS = 30;

const unread: Record<number, number> = {};
const typing: Record<number, Record<number, string>> = {};
const state = reactive({
  users: [
    { id: 1, firstName: 'Jana', lastName: 'Nováková', nickName: 'jana', email: 'jana@flack.sk', password: '1234', status: 'online' },
    { id: 2, firstName: 'Eduard', lastName: 'Kováč', nickName: 'ed', email: 'ed@flack.sk', password: '1234', status: 'online' },
    { id: 3, firstName: 'Mia', lastName: 'Horváthová', nickName: 'mia', email: 'mia@flack.sk', password: '1234', status: 'dnd' },
    { id: 4, firstName: 'Tomáš', lastName: 'Šimko', nickName: 'tom', email: 'tom@flack.sk', password: '1234', status: 'offline' },
  ] as User[],
  channels: [] as Channel[],
  messages: [] as Message[],
  invites: [{ channelId: 5, userId: 1 }] as Invite[],
  pending: [] as Message[],
  unread: unread,
  typing: typing,
  currentUserId: null as number | null,
  activeChannelId: null as number | null,
  mentionsOnly: false,
});
export const ui = reactive({ membersDialog: false, settingsDialog: false, liveUserId: null as number | null });

let seq = 1000;
const nextId = () => ++seq;
const mkCh = (id: number, name: string, type: 'public' | 'private', adminId: number, members: number[], last = t0): Channel =>
  ({ id, name, type, adminId, createdAt: last - 40 * DAY, lastActivityAt: last, members, banned: [], kickVotes: {} });
state.channels.push(
  mkCh(1, 'general', 'public', 2, [1, 2, 3, 4]),
  mkCh(2, 'project-x', 'private', 1, [1, 2]),
  mkCh(3, 'random', 'public', 3, [3, 4, 2]),
  mkCh(4, 'archiv', 'public', 2, [1, 2], t0 - 27 * DAY),   // o 3 dni zanikne (30-dňová neaktivita)
  mkCh(5, 'design', 'private', 4, [4, 3]),                  // pozvánka pre používateľa jana
);
const phrases = ['Adamko si génius', 'VPWA je skvelý predmet', 'pushol som github', 'niekto eat?'];
function gen(channelId: number, authors: number[], count: number, end = t0) {
  for (let i = 0; i < count; i++) {
    const a = authors[i % authors.length]!;
    const mention = i % 15 === 0 && a !== 1;
    state.messages.push({ id: nextId(), channelId, authorId: a, createdAt: end - (count - i) * 37 * MIN,
      text: `${mention ? '@jana ' : ''}${phrases[(i * 7) % phrases.length]} (#${i + 1})`, mentions: mention ? [1] : [] });
  }
}
gen(1, [2, 3, 4, 1], 160); gen(2, [1, 2], 40); gen(3, [3, 4, 2], 30); gen(4, [1, 2], 3, t0 - 27 * DAY);





//pomocne hodnoty a fc
const byNick = (n: string) => state.users.find((u) => u.nickName.toLowerCase() === n.replace(/^@/, '').toLowerCase());
const userById = (id: number) => state.users.find((u) => u.id === id);
const ok = (message: string, goTo?: number): Result => ({ ok: true, message, goTo });
const fail = (message: string): Result => ({ ok: false, message });
const me = computed(() => state.users.find((u) => u.id === state.currentUserId) ?? null);
const activeChannel = computed(() => {
  const c = state.channels.find((x) => x.id === state.activeChannelId);
  return c && me.value && c.members.includes(me.value.id) ? c : null;
});
const isAdmin = (c: Channel) => c.adminId === me.value?.id;




//invites a kanaly zoradenie
const sidebarChannels = computed(() => {
  if (!me.value) return [];
  const inv = state.invites.filter((i) => i.userId === me.value!.id)
    .map((i) => ({ channel: state.channels.find((c) => c.id === i.channelId)!, invited: true })).filter((x) => x.channel);
  const mem = state.channels.filter((c) => c.members.includes(me.value!.id))
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt).map((channel) => ({ channel, invited: false }));
  return [...inv, ...mem];
});
const discoverable = computed(() => !me.value ? [] : state.channels.filter((c) => c.type === 'public' && !c.members.includes(me.value!.id)
  && !c.banned.includes(me.value!.id) && !state.invites.some((i) => i.userId === me.value!.id && i.channelId === c.id)));
const typingUsers = computed(() => {
  const c = activeChannel.value;
  if (!c || !me.value || me.value.status === 'offline') return [];
  return Object.entries(state.typing[c.id] ?? {}).filter(([id]) => +id !== me.value!.id)
    .map(([id, draft]) => ({ user: userById(+id)!, draft }));
});
const channelMessages = (id: number) => state.messages.filter((m) => m.channelId === id).sort((a, b) => a.createdAt - b.createdAt);
const daysLeft = (c: Channel) => EXPIRE_DAYS - Math.floor((Date.now() - c.lastActivityAt) / DAY);




//autentifikacia
function register(d: { firstName: string; lastName: string; nickName: string; email: string; password: string }): Result {
  if (byNick(d.nickName)) return fail('Prezývka (nickName) je už obsadená.');
  if (state.users.some((u) => u.email.toLowerCase() === d.email.toLowerCase())) return fail('Email je už registrovaný.');
  const u: User = { id: nextId(), ...d, status: 'online' };
  state.users.push(u); state.currentUserId = u.id;
  return ok(`Vitaj, ${u.firstName}!`);
}
function login(idOrEmail: string, password: string): Result {
  const u = state.users.find((x) => x.email.toLowerCase() === idOrEmail.toLowerCase() || x.nickName.toLowerCase() === idOrEmail.toLowerCase());
  if (!u || u.password !== password) return fail('Nesprávne prihlasovacie údaje.');
  state.currentUserId = u.id; setStatus('online');
  return ok(`Vitaj späť, ${u.firstName}!`);
}
function logout() { state.currentUserId = null; state.activeChannelId = null; }
function setStatus(s: Status) {
  if (!me.value) return;
  me.value.status = s;
  if (s === 'online' && state.pending.length) {   // po prepnutí online sa kanály automaticky aktualizujú
    const n = state.pending.length;
    state.pending.splice(0).forEach((m) => addIncoming(m, true));
    Notify.create({ type: 'info', message: `Kanály aktualizované – ${n} nových správ` });
  }
}




//kanaly
function removeMember(c: Channel, id: number) { c.members = c.members.filter((m) => m !== id); delete c.kickVotes[id]; }
function deleteChannel(id: number) {
  state.channels = state.channels.filter((c) => c.id !== id);
  state.messages = state.messages.filter((m) => m.channelId !== id);
  state.invites = state.invites.filter((i) => i.channelId !== id);
  delete state.typing[id]; delete state.unread[id];
}
function pruneInactive() {
  state.channels.filter((c) => daysLeft(c) <= 0).forEach((c) => deleteChannel(c.id));
}
function join(name: string, priv: boolean): Result {
  const u = me.value!;
  const c = state.channels.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!c) {
    if (!/^[\w-]{2,24}$/.test(name)) return fail('Neplatný názov kanála (2–24 znakov: písmená, čísla, -, _).');
    const n = mkCh(nextId(), name, priv ? 'private' : 'public', u.id, [u.id]);
    state.channels.push(n);
    return ok(`Kanál #${name} vytvorený (${n.type === 'private' ? 'súkromný' : 'verejný'}).`, n.id);
  }
  if (c.members.includes(u.id)) return ok(`Už ste členom #${c.name}.`, c.id);
  if (c.banned.includes(u.id)) return fail(`V kanáli #${c.name} máte trvalý ban.`);
  const hasInvite = state.invites.some((i) => i.userId === u.id && i.channelId === c.id);
  if (c.type === 'private' && !hasInvite) return fail('Súkromný kanál – potrebujete pozvánku.');
  c.members.push(u.id); state.invites = state.invites.filter((i) => !(i.userId === u.id && i.channelId === c.id));
  return ok(`Pripojili ste sa do #${c.name}.`, c.id);
}
const acceptInvite = (id: number): Result => { const c = state.channels.find((x) => x.id === id); return c ? join(c.name, false) : fail('Kanál už neexistuje.'); };
const declineInvite = (id: number) => { state.invites = state.invites.filter((i) => !(i.channelId === id && i.userId === me.value?.id)); };
function cancelMembership(id: number): Result {
  const c = state.channels.find((x) => x.id === id); if (!c || !me.value) return fail('Kanál neexistuje.');
  if (isAdmin(c)) { deleteChannel(id); return ok(`Správca opustil #${c.name} – kanál zanikol.`); }
  removeMember(c, me.value.id); return ok(`Opustili ste #${c.name}.`);
}
function quitChannel(id: number): Result {
  const c = state.channels.find((x) => x.id === id);
  if (!c || !isAdmin(c)) return fail('Kanál môže zrušiť iba správca.');
  deleteChannel(id); return ok(`Kanál #${c.name} bol zrušený.`);
}




//prikazy
function execute(raw: string): Result {
  const text = raw.trim();
  if (!text) return fail('Prázdna správa.');
  if (!me.value) return fail('Najprv sa prihláste.');
  if (!text.startsWith('/')) return sendMessage(text);
  const [cmd, a1, a2] = text.split(/\s+/); const c = activeChannel.value; const u = me.value;
  const needCh = () => (c ? null : fail('Príkaz funguje iba v otvorenom kanáli.'));
  const target = () => (a1 ? byNick(a1) : undefined);
  switch (cmd!.toLowerCase()) {
    case '/join': return a1 ? join(a1, a2?.toLowerCase() === 'private') : fail('Použitie: /join channelName [private]');
    case '/list': if (needCh()) return needCh()!; ui.membersDialog = true; return ok('');
    case '/cancel': return needCh() ?? cancelMembership(c!.id);
    case '/quit': return needCh() ?? quitChannel(c!.id);
    case '/invite': {
      if (needCh()) return needCh()!;
      if (!a1) return fail('Použitie: /invite nickName');
      const t = target(); if (!t) return fail(`Používateľ ${a1} neexistuje.`);
      if (c!.type === 'private' && !isAdmin(c!)) return fail('Do súkromného kanála pozýva iba správca.');
      if (c!.members.includes(t.id)) return fail(`${t.nickName} je už členom.`);
      if (c!.banned.includes(t.id)) { if (!isAdmin(c!)) return fail('Ban môže zrušiť iba správca.'); c!.banned = c!.banned.filter((x) => x !== t.id); }
      if (!state.invites.some((i) => i.userId === t.id && i.channelId === c!.id)) state.invites.push({ channelId: c!.id, userId: t.id });
      return ok(`Pozvánka pre ${t.nickName} odoslaná.`);
    }
    case '/revoke': {
      if (needCh()) return needCh()!;
      if (c!.type !== 'private') return fail('/revoke funguje iba v súkromnom kanáli (vo verejnom použite /kick).');
      if (!isAdmin(c!)) return fail('Iba správca môže odoberať používateľov.');
      const t = target(); if (!t || !c!.members.includes(t.id)) return fail('Používateľ nie je členom kanála.');
      if (t.id === u.id) return fail('Seba nemôžete odobrať (použite /cancel).');
      removeMember(c!, t.id); state.invites = state.invites.filter((i) => !(i.userId === t.id && i.channelId === c!.id));
      return ok(`${t.nickName} bol odobraný.`);
    }
    case '/kick': {
      if (needCh()) return needCh()!;
      if (c!.type !== 'public') return fail('/kick funguje iba vo verejnom kanáli (v súkromnom použite /revoke).');
      const t = target(); if (!t || !c!.members.includes(t.id)) return fail('Používateľ nie je členom kanála.');
      if (t.id === c!.adminId || t.id === u.id) return fail('Tohto používateľa nemožno vyhodiť.');
      const ban = () => { removeMember(c!, t.id); c!.banned.push(t.id); return ok(`${t.nickName} má trvalý ban v #${c!.name}.`); };
      if (isAdmin(c!)) return ban();
      const votes = (c!.kickVotes[t.id] ??= []);
      if (votes.includes(u.id)) return fail('Za vyhodenie tohto používateľa ste už hlasovali.');
      votes.push(u.id);
      return votes.length >= 3 ? ban() : ok(`Hlas za vyhodenie ${t.nickName}: ${votes.length}/3.`);
    }
    default: return fail(`Neznámy príkaz ${cmd}.`);
  }
}
function sendMessage(text: string): Result {
  const c = activeChannel.value;
  if (!c || !me.value) return fail('Správu môžete odoslať iba v kanáli, ktorého ste členom.');
  const mentions = [...text.matchAll(/@(\w+)/g)].map((m) => byNick(m[1]!)?.id).filter((x): x is number => !!x);
  state.messages.push({ id: nextId(), channelId: c.id, authorId: me.value.id, text, createdAt: Date.now(), mentions });
  c.lastActivityAt = Date.now(); setTyping('');
  return ok('');
}
function setActive(id: number | null) { state.activeChannelId = id; if (id) state.unread[id] = 0; }
function setTyping(draft: string) {
  const c = activeChannel.value; if (!c || !me.value) return;
  const t = (state.typing[c.id] ??= {});
  if (draft && !draft.startsWith('/')) t[me.value.id] = draft; else delete t[me.value.id];
}




//noifikacky
const requestNotifyPermission = () => { if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission(); };
function notify(m: Message) {
  const u = me.value; if (!u || u.status !== 'online' || AppVisibility.appVisible) return;  // iba keď app nie je "visible"
  const mentioned = m.mentions.includes(u.id);
  if (state.mentionsOnly && !mentioned) return;
  const title = `${userById(m.authorId)?.nickName} • #${state.channels.find((c) => c.id === m.channelId)?.name}`;
  const body = m.text.length > 80 ? m.text.slice(0, 80) + '…' : m.text;
  if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
  else Notify.create({ message: title, caption: body, position: 'top-right' });
}
function addIncoming(m: Message, silent = false) {
  const c = state.channels.find((x) => x.id === m.channelId); if (!c) return;
  state.messages.push(m); c.lastActivityAt = m.createdAt;
  if (c.id !== state.activeChannelId) state.unread[c.id] = (state.unread[c.id] ?? 0) + 1;
  if (!silent) notify(m);
}




//simulovany chat
let started = false;
function simulate() {
  const u = me.value; if (!u) return;
  const mine = state.channels.filter((c) => c.members.includes(u.id) && c.members.length > 1);
  const c = (activeChannel.value && Math.random() < 0.6 ? activeChannel.value : mine[Math.floor(Math.random() * mine.length)]);
  if (!c) return;
  const others = c.members.filter((id) => id !== u.id); if (!others.length) return;
  const uid = others[Math.floor(Math.random() * others.length)]!;
  const text = (Math.random() < 0.4 ? `@${u.nickName} ` : '') + phrases[Math.floor(Math.random() * phrases.length)];
  let i = 0; const t = (state.typing[c.id] ??= {});
  const timer = setInterval(() => {
    t[uid] = text.slice(0, ++i);
    if (i >= text.length) {
      clearInterval(timer); delete t[uid];
      const msg: Message = { id: nextId(), channelId: c.id, authorId: uid, text, createdAt: Date.now(), mentions: text.startsWith('@') ? [u.id] : [] };
      if (me.value?.status === 'offline') state.pending.push(msg); else addIncoming(msg);
    }
  }, 90);
}
function init() {
  if (started) return; started = true;
  pruneInactive(); setInterval(pruneInactive, 60_000); setInterval(simulate, 15_000);
}
export function useChat() {
  return { state, ui, me, activeChannel, sidebarChannels, discoverable, typingUsers, channelMessages, userById, daysLeft, isAdmin,
    register, login, logout, setStatus, execute, acceptInvite, declineInvite, cancelMembership, quitChannel, setActive, setTyping,
    init, requestNotifyPermission };
}
