import decrypt from "./decrypt"
import encrypt from "./encrypt"
import generateKeyPair from "./generateKeyPair"
import { readKey, writeKey } from "./keyfileUtils"

const rsaKey = generateKeyPair()
writeKey("mykey", rsaKey)
const key = readKey("test_rsa")
console.log(`n: ${key.n.toString(16)}`)
console.log(`e: ${key.e.toString(16)}`)
console.log(`d: ${key.d.toString(16)}`)
console.log(`p: ${key.p.toString(16)}`)
console.log(`q: ${key.q.toString(16)}`)

const plaintext = "This is plaintext, but it's definitely more than 60 bytes. Yup. Definitely more."
console.log(`Plaintext: ${plaintext}`)
const message = Buffer.from(plaintext)
console.log(`Message: ${message.toString("hex")}`)
const encrypted = encrypt(message, rsaKey.e, rsaKey.n)
console.log(`Encrypted: ${encrypted.toString("hex")}`)
const decrypted = decrypt(encrypted, rsaKey.d, rsaKey.n)
console.log(`Decrypted: ${decrypted.toString("hex")}`)
console.log(`Recovered: ${decrypted.toString("ascii")}`)
