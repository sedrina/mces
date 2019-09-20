function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function std_max(val0, val1) {
    return val0 > val1 ? val0 : val1;
}

function std_min(val0, val1) {
    return val0 < val1 ? val0 : val1;
}

function notImplemented() {
    throw 'Not Implemented';
}