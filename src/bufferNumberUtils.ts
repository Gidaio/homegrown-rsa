export function bufferToBigInt(buffer: Buffer): bigint {
	let num = 0n
	for (const byte of buffer) {
		num <<= 8n
		num |= BigInt(byte)
	}

	return num
}

export function bigIntToBuffer(num: bigint, bufferLength: number): Buffer {
	const buffer = Buffer.alloc(bufferLength)
	for (let i = buffer.length - 1; i >= 0; i--) {
		buffer.writeUInt8(Number(num & 0xffn), i)
		num >>= 8n
	}

	return buffer
}
