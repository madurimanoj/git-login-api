const $apply = ($fnString, ...args) => caller => $.fn[$fnString].apply(caller, args)

export const $next = $apply('next')

export const $prev = $apply('prev')

const $unselect = $apply('removeClass', 'selected')

const $select = $apply('addClass', 'selected')

const run = (...args) => caller => args.reduce((acc, curr) => curr(acc), caller)

export const moveFocus = (tgt, shift) => shift ? run($unselect, shift, $select)(tgt) : $select(tgt)
