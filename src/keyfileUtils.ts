import { readFileSync } from "fs"

interface RSAKey {
	n: bigint
	e: bigint
	d: bigint
	p: bigint
	q: bigint
}

export function readKey(filename: string): RSAKey {
	const der = Buffer.from(
		readFileSync(filename, "ascii")
			.trim()
			.split("\n")
			.slice(1, -1)
			.join(""),
		"base64"
	)

	let offset = 0

	if (der[offset++] !== 0x30) {
		throw new Error(`Expected SEQUENCE, got "${der[offset - 1]}".`)
	}
	readLength()
	readInteger()
	const n = readInteger()
	const e = readInteger()
	const d = readInteger()
	const p = readInteger()
	const q = readInteger()

	return { n, e, d, p, q }

	function readInteger(): bigint {
		if (der[offset++] !== 0x02) {
			throw new Error(`Expected INTEGER, got "${der[offset - 1]}".`)
		}

		const length = readLength()
		const integer = bufferToBigInt(der.subarray(offset, offset + length))
		offset += length

		return integer
	}

	function readLength(): number {
		const lengthFirstByte = der[offset++]
		let length
		if (lengthFirstByte & 0x80) {
			const numberOfBytes = lengthFirstByte & 0x7F
			length = Number(bufferToBigInt(der.subarray(offset, offset + numberOfBytes)))
			offset += numberOfBytes
		} else {
			length = lengthFirstByte
		}

		return length
	}
}

function bufferToBigInt(buffer: Buffer): bigint {
	let out = 0n
	for (let i = 0; i < buffer.length; i++) {
		out <<= 8n
		out |= BigInt(buffer[i])
	}

	return out
}
