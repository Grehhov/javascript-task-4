'use strict';

var PRIORITIES_FOR_FUNCS = {
    'filterIn': 0,
    'or': 0,
    'and': 0,
    'sortBy': 1,
    'select': 2,
    'limit': 3,
    'format': 4
};
exports.isStar = true;

function getCopyCollection(collection) {
    return collection.map(function (object) {
        return Object.keys(object).reduce(function (copyObject, key) {
            copyObject[key] = object[key];

            return copyObject;
        }, {});
    });
}

exports.query = function (collection) {
    var newCollection = getCopyCollection(collection);
    var funcs = [].slice.call(arguments, 1);

    return funcs
        .sort(function (a, b) {
            return PRIORITIES_FOR_FUNCS[a.name] - PRIORITIES_FOR_FUNCS[b.name];
        })
        .reduce(function (c, func) {
            newCollection = func(newCollection);

            return newCollection;
        }, newCollection);
};

exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (humon) {
            var newHumon = fields.reduce(function (changedHumon, field) {
                if (Object.keys(humon).indexOf(field) !== -1) {
                    changedHumon[field] = humon[field];
                }

                return changedHumon;
            }, {});
            if (Object.keys(newHumon).length) {
                return newHumon;
            }

            return humon;
        });
    };
};

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (humon) {
            return values.indexOf(humon[property]) !== -1;
        }, []);
    };
};

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort(function (a, b) {
            var result = a[property] > b[property] ? 1 : -1;

            return order === 'asc' ? result : -result;
        });
    };
};

exports.format = function (property, formatter) {

    return function format(collection) {
        collection.forEach(function (humon) {
            humon[property] = formatter(humon[property]);
        });

        return collection;
    };
};

exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {
    exports.or = function () {
        var filters = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (humon) {
                return filters.some(function (filter) {
                    return filter([humon]).length === 1;
                });
            }, []);
        };
    };

    exports.and = function () {
        var filters = [].slice.call(arguments);

        return function and(collection) {
            return filters.reduce(function (returnCollection, filter) {
                collection = filter(collection);

                return collection;
            }, []);
        };
    };
}
