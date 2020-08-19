module.exports = {
    toArray(concurrency, array, convertFn) {
        const result = [];
        return executePromisePool(
            concurrency,
            Enumerator(array, convertFn),
            (e) => result.push(e)
        ).then(() => result);
    },
    toMap(concurrency, array, convertFn) {
        const result = new Map();
        return executePromisePool(
            concurrency,
            Enumerator(array, convertFn),
            (e) => result.set(e.key, e.value)
        ).then(() => result);
    },
    exec(concurrency, array, convertFn) {
        return executePromisePool(
            concurrency,
            Enumerator(array, convertFn)
        ).then(r => array);
    }
}

function Enumerator(source, map) {
    let _current;
    let _index = 0;
    return {
        next() {
            if (_index >= source.length) return false;
            _current = map ? map(source[_index++]) : source[_index++];
            return true;
        },
        get current() { return _current }
    }
}

function executePromisePool(concurrency, enumerator, success, failed) {
    let _size = 0;

    return new Promise(_getNext);

    function _getNext(resolve, reject) {
        while (_size < concurrency && enumerator.next()) {
            _size++;
            _create(resolve, reject, enumerator.current)
        }
        if (_size === 0) resolve();
    }

    function _create(resolve, reject, promise) {
        promise.then(
            result => {
                _size--
                success && success(result, promise);
                _getNext(resolve, reject);
            },
            error => {
                _size--
                failed && failed(error, promise);
                reject(error || new Error('Unknown error'))
            }
        ) ['catch'](err => {
            reject(new Error('Promise processing failed: ' + err))
        })
    }
}
