import { readFileSync, writeFileSync } from "fs"
import { modularInverse } from "./modularUtils"

export interface RSAKey {
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

export function writeKey(filename: string, key: RSAKey): void {
	const n = new ASN1Integer(key.n)
	const e = new ASN1Integer(key.e)
	const d = new ASN1Integer(key.d)
	const p = new ASN1Integer(key.p)
	const q = new ASN1Integer(key.q)
	const exponent1 = new ASN1Integer(key.d % (key.p - 1n))
	const exponent2 = new ASN1Integer(key.d % (key.q - 1n))
	const coefficient = new ASN1Integer(modularInverse(key.q, key.p))
	const sequenceBodyLength = n.totalLength() + e.totalLength() + d.totalLength() + p.totalLength()
		+ q.totalLength() + exponent1.totalLength() + exponent2.totalLength()
		+ coefficient.totalLength()
	let sequenceTotalLength = sequenceBodyLength
	let sequenceLengthLength = -1
	if (sequenceBodyLength > 127) {
		sequenceLengthLength = byteLength(sequenceBodyLength)
		sequenceTotalLength += sequenceLengthLength
	}
	sequenceTotalLength += 2

	const der = Buffer.alloc(sequenceTotalLength)
	let derOffset = 0
	der[derOffset++] = 0x30
	if (sequenceBodyLength > 127) {
		der[derOffset++] = sequenceLengthLength | 0x80
		writeNumber(sequenceBodyLength, sequenceLengthLength, der, derOffset)
		derOffset += sequenceLengthLength
	} else {
		der[derOffset++] = sequenceBodyLength
	}

	n.write(der, derOffset)
	derOffset += n.totalLength()
	e.write(der, derOffset)
	derOffset += e.totalLength()
	d.write(der, derOffset)
	derOffset += d.totalLength()
	p.write(der, derOffset)
	derOffset += p.totalLength()
	q.write(der, derOffset)
	derOffset += q.totalLength()
	exponent1.write(der, derOffset)
	derOffset += exponent1.totalLength()
	exponent2.write(der, derOffset)
	derOffset += exponent2.totalLength()
	coefficient.write(der, derOffset)
	derOffset += coefficient.totalLength()

	const base64 = der.toString("base64")
	const pemParts = ["-----BEGIN RSA PRIVATE KEY-----"]
	for (let i = 0; i < base64.length; i += 64) {
		pemParts.push(base64.slice(i, i + 64))
	}
	pemParts.push("-----END RSA PRIVATE KEY-----", "")

	writeFileSync(filename, pemParts.join("\n"))
}

function bufferToBigInt(buffer: Buffer): bigint {
	let out = 0n
	for (let i = 0; i < buffer.length; i++) {
		out <<= 8n
		out |= BigInt(buffer[i])
	}

	return out
}

class ASN1Integer {
	public int: bigint
	private _bodyLength = -1
	private _totalLength = -1
	private _lengthLength = -1

	public constructor(num: bigint) {
		this.int = num
	}

	public write(buffer: Buffer, offset: number): void {
		buffer[offset++] = 0x02

		if (this.bodyLength() > 127) {
			buffer[offset++] = this._lengthLength | 0x80
			writeNumber(this.bodyLength(), this._lengthLength, buffer, offset)
			offset += this._lengthLength
		} else {
			buffer[offset++] = this.bodyLength()
		}

		this.writeBigInt(this.int, this.bodyLength(), buffer, offset)
	}

	private writeBigInt(int: bigint, length: number, buffer: Buffer, offset: number): void {
		for (let i = length - 1; i >= 0; i--) {
			buffer[offset + i] = Number(int & 0xFFn)
			int >>= 8n
		}
	}

	public totalLength(): number {
		if (this._totalLength < 0) {
			this._totalLength = this.bodyLength()
			if (this.bodyLength() > 127) {
				this._lengthLength = byteLength(this.bodyLength())
				this._totalLength += this._lengthLength
			}
			this._totalLength += 2
		}

		return this._totalLength
	}

	public bodyLength(): number {
		if (this._bodyLength < 0) {
			this._bodyLength = byteLength(this.int)
			if (this.int & 0x80n << BigInt((this._bodyLength - 1) * 8)) {
				this._bodyLength += 1
			}
		}

		return this._bodyLength
	}
}

function writeNumber(num: number, length: number, buffer: Buffer, offset: number): void {
	if (num > 2 ** 32 - 1) {
		throw new Error("Number too large.")
	}

	for (let i = length - 1; i >= 0; i--) {
		buffer[offset + i] = num & 0xFF
		num >>>= 8
	}
}

function byteLength(num: number | bigint): number {
	return Math.ceil(num.toString(16).length / 2)
}
