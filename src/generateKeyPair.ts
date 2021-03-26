import { RSAKey } from "./keyfileUtils"
import { modularInverse, modularPower } from "./modularUtils"

export default function generateKeyPair(log: boolean = false): RSAKey {
	const p = randomPrime(288)
	const q = randomPrime(224)
	const n = p * q
	const lambdaN = lcm(p - 1n, q - 1n)
	const e = 0x10001n
	const d = modularInverse(e, lambdaN)
	if (log) {
		console.log(`p: ${p.toString(16)}`)
		console.log(`q: ${q.toString(16)}`)
		console.log(`n: ${n.toString(16)}`)
		console.log(`lambdaN: ${lambdaN.toString(16)}`)
		console.log(`e: ${e.toString(16)}`)
		console.log(`d: ${d.toString(16)}`)
	}

	return { e, d, n, p, q }
}

function randomPrime(bits: number): bigint {
	let prime
	do {
		prime = randomOddNumber(bits)
	} while (!isPrime(prime))

	return prime
}

function lcm(a: bigint, b: bigint): bigint {
	let product = a * b
	if (product < 0) {
		product = -product
	}

	return product / gcd(a, b)
}

function gcd(a: bigint, b: bigint): bigint {
	if (a < b) {
		[a, b] = [b, a]
	}

	while (a % b > 0) {
		[a, b] = [b, a % b]
	}

	return b
}

function randomOddNumber(bits: number): bigint {
	let num = 0b10n
	for (let i = 1; i < bits - 1; i++) {
		if (Math.random() < 0.5) {
			num |= 1n
		}
		num <<= 1n
	}

	return (num | 1n) >> 0n
}

function isPrime(num: bigint): boolean {
	return modularPower(2n, num - 1n, num) === 1n
}