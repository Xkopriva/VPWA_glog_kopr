import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.users.update': { paramsTuple?: []; params?: {} }
    'profile.users.update_status': { paramsTuple?: []; params?: {} }
    'profile.users.destroy': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.index': { paramsTuple?: []; params?: {} }
    'channels.channels.store': { paramsTuple?: []; params?: {} }
    'channels.channels.prune': { paramsTuple?: []; params?: {} }
    'channels.channels.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.leave': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.accept_invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.decline_invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.revoke': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'userId': ParamValue} }
    'channels.channels.kick': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.index': { paramsTuple?: []; params?: {} }
    'channels.channels.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.index': { paramsTuple?: []; params?: {} }
    'channels.channels.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'channels.channels.store': { paramsTuple?: []; params?: {} }
    'channels.channels.invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.accept_invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.kick': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'profile.users.update': { paramsTuple?: []; params?: {} }
    'profile.users.update_status': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'profile.users.destroy': { paramsTuple?: []; params?: {} }
    'channels.channels.prune': { paramsTuple?: []; params?: {} }
    'channels.channels.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.leave': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.decline_invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'channels.channels.revoke': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'userId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}