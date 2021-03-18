import { bufferToNumber, numberToBuffer } from "./bufferNumberUtils"
import generateKeyPair from "./generateKeyPair"
import modularPower from "./modularPower"

const { e, d, n } = generateKeyPair()

const message = "Longer, but still fits in 63 bytes. Yup. Still fits. Totally."
const messageNumber = bufferToNumber(Buffer.from(message))
const encrypted = modularPower(messageNumber, e, n)
console.log(message)
console.log(messageNumber.toString(16))
console.log(encrypted.toString(16))

const decrypted = modularPower(encrypted, d, n)
console.log(decrypted.toString(16))
const messageBuffer = numberToBuffer(decrypted, message.length)
console.log(messageBuffer.toString("ascii"))

function randomNumber(bits: number): bigint {
	let num = 0n
	for (let i = 0; i < bits; i++) {
		if (Math.random() < 0.5) {
			num |= 1n
		}
		num <<= 1n
	}

	if (Math.random() < 0.5) {
		num |= 1n
	}

	return num
}
