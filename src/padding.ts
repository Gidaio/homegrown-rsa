import { createHash } from "crypto"

export function padMessage(message: Buffer): Buffer {
	if (message.length > 60) {
		throw new Error("Message too long.")
	}

	let outputBuffer = Buffer.alloc(63)
	outputBuffer.set(message)
	// console.log(`Base:           ${outputBuffer.toString("hex")}`)
	outputBuffer[message.length] = 0x80
	for (let i = message.length + 1; i < 61; i++) {
		outputBuffer[i] = 0x00
	}
	// console.log(`Padded:         ${outputBuffer.toString("hex")}`)

	for (let i = 61; i < 63; i++) {
		outputBuffer[i] = Math.floor(Math.random() * 0x100)
	}
	// console.log(`Random added:   ${outputBuffer.toString("hex")}`)

	const randomHash = createHash("sha512")
	randomHash.update(outputBuffer.subarray(61, 63))
	const hashedRandom = randomHash.digest()
	// console.log(`Hashed random:  ${hashedRandom.toString("hex")}`)

	xorBuffers(outputBuffer.subarray(0, 61), hashedRandom)
	// console.log(`Random XORed:   ${outputBuffer.toString("hex")}`)

	const messageHash = createHash("sha256")
	messageHash.update(outputBuffer.subarray(0, 61))
	const hashedMessage = messageHash.digest()
	// console.log(`Hashed message: ${hashedMessage.toString("hex")}`)

	xorBuffers(outputBuffer.subarray(61, 63), hashedMessage)
	// console.log(`Message XORed:  ${outputBuffer.toString("hex")}`)

	return outputBuffer
}

export function unpadMessage(padded: Buffer): Buffer {
	const workingBuffer = Buffer.from(padded)
	// console.log(`Input:          ${workingBuffer.toString("hex")}`)

	const messageHash = createHash("sha256")
	messageHash.update(workingBuffer.subarray(0, 61))
	const hashedMessage = messageHash.digest()
	// console.log(`Hashed message: ${hashedMessage.toString("hex")}`)

	xorBuffers(workingBuffer.subarray(61, 63), hashedMessage)
	// console.log(`Message XORed:  ${workingBuffer.toString("hex")}`)

	const randomHash = createHash("sha512")
	randomHash.update(workingBuffer.subarray(61, 63))
	const hashedRandom = randomHash.digest()
	// console.log(`Hashed random:  ${hashedRandom.toString("hex")}`)

	xorBuffers(workingBuffer.subarray(0, 61), hashedRandom)
	// console.log(`Random XORed:   ${workingBuffer.toString("hex")}`)

	let messageLength = 0
	for (let i = 60; i >= 0; i--) {
		if (workingBuffer[i] === 0x80) {
			messageLength = i
			break
		}
	}
	// console.log(`Message length: ${messageLength}`)

	const outputBuffer = Buffer.alloc(messageLength)
	workingBuffer.copy(outputBuffer, 0, 0, messageLength)

	return outputBuffer
}

function xorBuffers(base: Buffer, xor: Buffer): void {
	for (let i = 0; i < base.length; i++) {
		base[i] ^= xor[i % xor.length]
	}
}
