const express = require('express');

const app = express()

app.use(express.urlencoded({ extended: false }))
    .use('/', require('./routes/index'))

const PORT = 3030 || process.env
app.listen(PORT, () => console.log(`Server now listen on port ${PORT}`))