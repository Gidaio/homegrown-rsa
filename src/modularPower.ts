export default function modularPower(base: bigint, exponent: bigint, modulus: bigint): bigint {
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
