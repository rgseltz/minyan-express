let PORT = 3001 || process.env.PORT;

let SECRET_KEY = process.SECRET_KEY || 'davening-dev32'

function getDatabaseUri() {
    return (process.env.NODE_ENV === "test") ? "minyan_express_test" : "minyan_express" || DATABASE_URL;
}

/*bcrypt work factor algorithm slows decryption - want to be slow for development and production and fast for testing **/
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = { getDatabaseUri, PORT, BCRYPT_WORK_FACTOR, SECRET_KEY }