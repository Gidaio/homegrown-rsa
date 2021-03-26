export function modularPower(base: bigint, exponent: bigint, modulus: bigint): bigint {
	if (modulus === 1n) {
		return 0n
	}

	let result = 1n
	base %= modulus
	while (exponent > 0n) {
		if (exponent & 1n) {
			result = (result * base) % modulus
		}
		exponent >>= 1n
		base = (base * base) % modulus
	}

	return result
}

export function modularInverse(num: bigint, modulus: bigint): bigint {
	let [t, newT] = [0n, 1n]
	let [r, newR] = [modulus, num]

	while (newR !== 0n) {
		const q = r / newR
		;[t, newT] = [newT, t - q * newT]
		;[r, newR] = [newR, r - q * newR]
	}

	if (r > 1) {
		throw new Error(`${num} is not invertible.`)
	}
	if (t < 0) {
		t += modulus
	}

	return t
}
