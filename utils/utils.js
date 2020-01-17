exports.findCookie = (headers, cookie_name) => {
    const cookies = headers && headers.split(';').map(cook => cook.split('=').map(r => r.trim()));
    if (cookies.length > 1) {
        const authExist = cookies && cookies.map(c => c.includes(cookie_name));
        let whichArr = authExist && authExist.indexOf(true);
        if (whichArr == -1) {
            return false
        }
        const index = cookies[whichArr].indexOf(cookie_name) + 1
        const cookie = index && cookies[whichArr][index];
        return cookie
    } else {
        if (cookies.length == 0) { return false }
        let auth = cookies[0].includes(cookie_name)
        // console.log('AUTH ', auth, cookies[0][1])
        return auth ? cookies[0][1] : false
    }
}

