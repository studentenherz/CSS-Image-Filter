import { SVD } from 'svd-js'

// #rrggbb
// #rrggbbaa
function hexToRGB(hexColor) {
  let bigint = parseInt(hexColor.substring(1), 16)
  let a = 0xff
  if (hexColor.length > 7) {
    a = bigint & 0xff
    bigint = bigint >> 8
  }

  const r = (bigint >> 16) & 0xff
  const g = (bigint >> 8) & 0xff
  const b = bigint & 0xff

  return [r, g, b, a]
}

function transpose(matrix) {
  let t = []
  const m = matrix.length
  const n = matrix[0].length

  for (let j = 0; j < n; j++) {
    let newRow = []
    for (let i = 0; i < m; i++) {
      newRow.push(matrix[i][j])
    }
    t.push(newRow)
  }

  return t
}

function calculateSVD(A) {
  const T = A.length < A[0].length
  if (T) {
    A = transpose(A)
  }

  let { u, q, v } = SVD(A, 'f')
  console.log('========= U de la mata =============')
  print(u)
  console.log('========= U_t de la mata =============')
  print(transpose(u))
  if (T) {
    const realV = transpose(u)
    u = transpose(v)
    v = realV
  }

  return { u, q, v }
}

function print(A) {
  let a = '[\n'
  for (let i = 0; i < A.length; i++) {
    a += `[${A[i].join(', ')}]\n`
  }
  a += ']'
  console.log(a)
}

function solve({ A, b }) {
  const { u, q, v: v_t } = calculateSVD(A)
  console.log('A')
  print(A)
  console.log('v_t')
  print(v_t)
  console.log('u')
  print(u)

  let qub = []

  q.forEach((qq, j) => {
    let s = 0
    if (qq > 0) {
      for (let i = 0; i < b.length; i++) {
        s += u[j][i] * b[i]
      }
      s /= qq
    }

    qub.push(s)
  })

  console.log('q', q)
  console.log('b')
  console.log(b)
  console.log('qub')
  console.log('qub', qub)

  let ans = []
  for (let i = 0; i < v_t[0].length; i++) {
    let s = 0
    for (let j = 0; j < qub.length; j++) {
      s += v_t[j][i] * qub[j]
    }

    ans.push(s)
  }

  let nullspace = []
  for (let i = 0; i < v_t.length; i++) {
    if (i >= q.length || q[i] == 0) {
      nullspace.push(v_t[i])
    }
  }

  console.log('ans\n', ans.join(' '))
  console.log(nullspace)

  let bb = []
  for (let i = 0; i < A.length; i++) {
    let s = 0
    for (let j = 0; j < ans.length; j++) {
      s += A[i][j] * ans[j]
    }
    bb.push(s)
  }

  console.log('==========A * ans ===============')
  console.log(bb)

  return { ans, nullspace }
}

/**
 * Calculate the matrix for the SVG filter
 *
 * @param {*} colors list of color mappings, as tuples
 */
export function calculateMatrix(colors) {
  let b = []
  let A = []

  colors.forEach(({ from, to }) => {
    const toRBG = hexToRGB(to)
    b = [...b, ...toRBG.map((x) => x / 0xff)]

    const fromRGB = hexToRGB(from)
    for (let i = 0; i < 4; i++) {
      let newRow = Array(20).fill(0)

      fromRGB.forEach((val, idx) => {
        newRow[i * 5 + idx] = val / 0xff
      })
      newRow[i * 5 + 4] = 1

      A = [...A, newRow]
    }
  })

  console.log('A')
  console.log(A)
  console.log('b')
  console.log(b)

  return solve({ A, b })
}
