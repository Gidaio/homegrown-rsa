import { bigIntToBuffer, bufferToBigInt } from "./bufferNumberUtils"
import { modularPower } from "./modularUtils"
import { unpadMessage } from "./padding"

export default function decrypt(ciphertext: Buffer, d: bigint, n: bigint): Buffer {
	const buffers: Buffer[] = []
	for (let i = 0; i < ciphertext.length; i += 64) {
		buffers.push(decryptNumber(ciphertext.subarray(i, i + 64), d, n))
	}

	const outputLength = buffers.reduce((length, buf) => length + buf.length, 0)
	const outputBuffer = Buffer.alloc(outputLength)
	buffers.forEach((buf, i) => {
		outputBuffer.set(buf, i * 60)
	})

	return outputBuffer
}

export function decryptNumber(ciphertext: Buffer, d: bigint, n: bigint): Buffer {
	const ciphertextNumber = bufferToBigInt(ciphertext)
	const paddedMessageNumber = modularPower(ciphertextNumber, d, n)
	const paddedMessage = bigIntToBuffer(paddedMessageNumber, 63)
	const message = unpadMessage(paddedMessage)

	return message
}
