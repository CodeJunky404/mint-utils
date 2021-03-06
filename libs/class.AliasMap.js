'use strict';

const
    precon = require('@makipool/mint-precon'),
    pu = require('./service.prototypes');


/**
 * A map of values that have a name and possibly aliases that can be used as keys.
 *
 * A value stored in the map is required to have a "name" property and an "aliasArr" property. The name and aliases
 * of a value should not change while contained in the map or the state of the map can become corrupted.
 */
class AliasMap {

    /**
     * Constructor.
     */
    constructor() {
        const _ = this;
        _._map = new Map();
        _._nameSet = new Set();
    }


    /**
     * Get the number of values in the map.
     * @returns {number}
     */
    get size() { return this._nameSet.size; }


    /**
     * Determine if the map contains a value by name or alias.
     *
     * @param nameOrAlias {string}
     * @returns {boolean}
     */
    has(nameOrAlias) {
        precon.string(nameOrAlias);

        const _ = this;
        return _._map.has(nameOrAlias);
    }


    /**
     * Get a value from the map by name or alias.
     *
     * @param nameOrAlias {string}
     * @returns {*}
     */
    get(nameOrAlias) {
        precon.string(nameOrAlias);

        const _ = this;
        return _._map.get(nameOrAlias);
    }


    /**
     * Set a value into the map by its name and aliases.
     *
     * @param key  An object that defines its own name and aliases.
     * @param key.name {string}
     * @param key.aliasArr {string[]}
     * @param [value] {*} The value to set. If undefined then the key is used as value.
     * @returns {AliasMap}
     */
    set(key, value) {
        precon.defined(key, 'value');
        precon.string(key.name, 'name');
        precon.arrayOf(key.aliasArr, 'string', 'aliasArr');

        const _ = this;

        value = typeof value === 'undefined' ? key : value;

        _._map.set(key.name, value);
        _._nameSet.add(key.name);

        key.aliasArr.forEach(aliasName => {
            _._map.set(aliasName, value);
        });

        return _;
    }


    /**
     * Delete a value from the map.
     *
     * @param key
     * @param key.name {string}
     * @param key.aliasArr {string[]}
     * @returns {boolean}
     */
    delete(key) {
        precon.defined(key, 'value');
        precon.string(key.name, 'name');
        precon.arrayOf(key.aliasArr, 'string', 'aliasArr');

        const _ = this;
        const isDeleted = _._map.delete(key.name);
        _._nameSet.delete(key.name);
        key.aliasArr.forEach(aliasName => {
            _._map.delete(aliasName);
        });
        return isDeleted;
    }


    /**
     * Clear all values from the map.
     */
    clear() {
        const _ = this;
        _._map.clear();
        _._nameSet.clear();
    }


    /**
     * Iterate values in the map.
     *
     * @param iteratorFn {function(value:*, index:number, AliasMap)}
     */
    forEach(iteratorFn) {
        precon.funct(iteratorFn, 'iteratorFn');

        const _ = this;
        let i = 0;
        for (const name of _._nameSet) {
            iteratorFn(_._map.get(name), i, _);
            i++;
        }
    }


    /**
     * Iterable names
     *
     * @returns {IterableIterator<string>}
     */
    keys() {
        const _ = this;
        return _._nameSet.values();
    }


    /**
     * Iterable values.
     *
     * @returns {IterableIterator<*>}
     */
    values() {
        const _ = this;
        const nameIterator = _._nameSet[Symbol.iterator]();
        return {
            [Symbol.iterator]() {
                return {
                    next() {
                        const n = nameIterator.next();
                        if (n.done)
                            return {value: undefined, done: true};

                        const name = n.value
                        return {value: _._map.get(name), done: false};
                    }
                }
            }
        };
    }


    [Symbol.iterator]() {
        const _ = this;
        const nameIterator = _._nameSet[Symbol.iterator]();
        return {
            next() {
                const n = nameIterator.next();
                if (n.done)
                    return { value: undefined, done: true };

                const name = n.value
                return { value: [name, _._map.get(name)], done: false };
            }
        };
    }


    static get CLASS_ID() { return '5b3c8170006ec3821d6a99cae4d62be499ac967288cfef08f65de866292e5dab'; }
    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfById(obj, AliasMap.CLASS_ID);
    }
}

module.exports = AliasMap;