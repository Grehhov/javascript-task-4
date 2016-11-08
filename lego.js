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

function copyCollection(collection) {
    return collection.reduce(function (copy, humon) {
        copy.push(Object.keys(humon).reduce(function (copyHumon, key) {
            copyHumon[key] = humon[key];

            return copyHumon;
        }, {}));

        return copy;
    }, []);
}

exports.query = function (collection) {
    var newCollection = copyCollection(collection);
    var funcs = [].slice.call(arguments, 1);

    return funcs
        .sort(function (a, b) {
            return PRIORITIES_FOR_FUNCS[a.name] - PRIORITIES_FOR_FUNCS[b.name];
        })
        .reduce(function (c, func) {
            newCollection = func(newCollection);

            return newCollection;
        }, []);
};

exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        fields = fields.reduce(function (currentFields, field) {
            if (Object.getOwnPropertyNames(collection[0]).indexOf(field) !== -1) {
                currentFields.push(field);
            }

            return currentFields;
        }, []);
        if (fields.length) {
            collection.forEach(function (people) {
                Object.getOwnPropertyNames(people).forEach(function (name) {
                    if (fields.indexOf(name) === -1) {
                        delete people[name];
                    }
                });
            });
        }

        return collection;
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
            var result = 0;
            if (a[property] > b[property]) {
                result = 1;
            }
            if (a[property] < b[property]) {
                result = -1;
            }

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
            return filters.reduce(function (c, filter) {
                collection = filter(collection);

                return collection;
            }, []);
        };
    };
}
