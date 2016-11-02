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
exports.isStar = false;

exports.query = function (collection) {
    var newCollection = collection.map(function (item) {
        return Object.assign({}, item);
    });
    var funcs = [].slice.call(arguments, 1);
    funcs = funcs.sort(function (a, b) {
        return PRIORITIES_FOR_FUNCS[a.name] - PRIORITIES_FOR_FUNCS[b.name];
    });
    funcs.forEach(function (func) {
        newCollection = func(newCollection);
    });

    return newCollection;
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
        var newCollection = [];
        collection.forEach(function (people) {
            if (values.indexOf(people[property]) !== -1) {
                newCollection.push(people);
            }
        });

        return newCollection;
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
        collection.forEach(function (people) {
            people[property] = formatter(people[property]);
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
            return filters.reduce(function (currentFilteredCollection, filter) {
                var filteredCollection = filter(collection);
                filteredCollection.forEach(function (item) {
                    if (currentFilteredCollection.indexOf(item) === -1) {
                        currentFilteredCollection.push(item);
                    }
                });

                return currentFilteredCollection;
            }, []);
        };
    };

    exports.and = function () {
        var filters = [].slice.call(arguments);

        return function and(collection) {
            filters.forEach(function (filter) {
                collection = filter(collection);
            });

            return collection;
        };
    };
}
