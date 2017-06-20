import { Map, List } from 'immutable'

const stateKeys = ['user', 'followers', 'pagination']

const $apply = ($fnString, ...args) => caller => $.fn[$fnString].apply(caller, args)

export const $next = $apply('next')

export const $prev = $apply('prev')

const $unselect = $apply('removeClass', 'selected')

export const $select = $apply('addClass', 'selected')

const compose = (...args) => caller => args.reduce((acc, curr) => curr(acc), caller)

export const scroll = (tgt, shift) => compose($unselect, shift, $select)(tgt)

export const formatURL = string => string ? /h(?:(?!>).)*/.exec(string)[0] : null

export const clearState = () => state => state.set('followers', new List()).set('user', new Map())

export const userUrl = (user, secretKey) => `https://api.github.com/users/${user}?access_token=${secretKey}`

export const followersUrl = (user, secretKey) => `https://api.github.com/users/${user}/followers?access_token=${secretKey}`
