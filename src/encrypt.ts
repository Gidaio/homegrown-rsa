import { bigIntToBuffer, bufferToBigInt } from "./bufferNumberUtils"
import { modularPower } from "./modularUtils"
import { padMessage } from "./padding"

export default function encrypt(message: Buffer, e: bigint, n: bigint): Buffer {
	// console.log(`Input length: ${message.length}`)
	const outputLength = Math.ceil(message.length / 60) * 64
	// console.log(`Output length: ${outputLength}`)
	let outputBuffer = Buffer.alloc(outputLength)

	for (let i = 0; i < message.length; i += 60) {
		outputBuffer.set(
			encryptNumber(message.subarray(i, i + 60), e, n),
			i / 60 * 64
		)
	}

	return outputBuffer
}

export function encryptNumber(message: Buffer, e: bigint, n: bigint): Buffer {
	const paddedMessage = padMessage(message)
	const paddedMessageNumber = bufferToBigInt(paddedMessage)
	const ciphertextNumber = modularPower(paddedMessageNumber, e, n)
	const ciphertext = bigIntToBuffer(ciphertextNumber, 64)

	return ciphertext
}
