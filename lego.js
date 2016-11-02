'use strict';

var PRIORITIES_FOR_FUNCS = {
    'filterIn': 0,
    'or': 0,
    'and': 0,
    'sortBy': 1,
    'select': 1,
    'limit': 2,
    'format': 3
};
var SELECTED_FIELDS;
/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    SELECTED_FIELDS = new Set();
    var newCollection = collection.map(function (item) {
       return Object.assign({}, item);
    });
    var funcs = [].slice.call(arguments, 1);
    funcs = funcs.sort(function (a, b) {
        return PRIORITIES_FOR_FUNCS[a.name] - PRIORITIES_FOR_FUNCS[b.name];
    });
    funcs.forEach(function (func){
        newCollection = func(newCollection);
    });
    if (SELECTED_FIELDS.size) {
        newCollection.forEach(function (people) {
            Object.getOwnPropertyNames(people).forEach(function (name) {
                if (!SELECTED_FIELDS.has(name)) {
                    delete people[name];
                }
            })
        });
    }

    return newCollection;
};

/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        fields.forEach(function (field) {
            if (collection.length > 0 && collection[0].hasOwnProperty(field))
                SELECTED_FIELDS.add(field);
        });

        return collection;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        var newCollection = [];
        collection.forEach(function (people) {
            if (values.indexOf(people[property]) != -1) {
                newCollection.push(people);
            }
        });

        return newCollection;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
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

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {

    return function format(collection) {
        collection.forEach(function (people) {
            people[property] = formatter(people[property]);
        });

        return collection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
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

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
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
