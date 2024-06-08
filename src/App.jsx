import { useEffect, useState } from 'react'
import './App.css'
import { calculateMatrix } from './util'

const TEMPLATE = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="background_color_filter" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="{}"/></filter></defs></svg>#background_color_filter')`

function App() {
  const [colors, setColors] = useState([])
  const [filter, setFilter] = useState(TEMPLATE)
  const [nullspace, setNullspace] = useState([])
  const [ans, setAns] = useState([])

  const addColorMapping = (event) => {
    event.preventDefault()

    let next_id = 0
    colors.forEach(({ id }) => {
      if (id >= next_id) {
        next_id = id + 1
      }
    })

    setColors((prevColors) => [
      ...prevColors,
      { from: '#ffffff', to: '#ffffff', id: next_id },
    ])
  }

  useEffect(() => {
    console.log(colors)
    if (colors.length > 0) {
      const { ans, nullspace } = calculateMatrix(colors)
      setAns(ans)
      setNullspace(nullspace)
    }
  }, [colors])

  const newFilter = () => {
    let values = ans
    nullspace.forEach((nvec) => {
      let k = Math.random()
      for (let i = 0; i < ans.length; i++) {
        values[i] += k * nvec[i]
      }
    })

    setFilter(
      TEMPLATE.replace('{}', values.length > 0 ? values.join(' ') : '{}')
    )
  }

  useEffect(() => {
    setFilter(TEMPLATE.replace('{}', ans.length > 0 ? ans.join(' ') : '{}'))
  }, [ans])

  const removeColorMappingGenerator = (idx) => () => {
    setColors((initial) => initial.filter(({ id }) => id != idx))
  }

  const onChangeFromColorGenerator = (idx) => (event) => {
    setColors((initial) =>
      initial.map((x) => (x.id != idx ? x : { ...x, from: event.target.value }))
    )
  }

  const onChangeToColorGenerator = (idx) => (event) => {
    setColors((initial) =>
      initial.map((x) => (x.id != idx ? x : { ...x, to: event.target.value }))
    )
  }

  return (
    <>
      <h1>CSS Image Filter</h1>
      <main>
        <section>
          <aside>
            <button disabled={colors.length >= 5} onClick={addColorMapping}>
              Add New Color Mapping
            </button>
            {colors.map(({ from, to, id }) => (
              <div key={id}>
                <input
                  onChange={onChangeFromColorGenerator(id)}
                  type="color"
                  value={from}
                />
                <input
                  onChange={onChangeToColorGenerator(id)}
                  type="color"
                  value={to}
                />
                <button onClick={removeColorMappingGenerator(id)}>
                  Remove Color Mapping
                </button>
              </div>
            ))}
          </aside>
        </section>
        <button onClick={newFilter}>New combination</button>
        <section className="images">
          <aside>
            <h2>Original</h2>
            <img src="/test.svg" alt="test image" />
          </aside>
          <aside>
            <h2>Filtered</h2>
            <img
              style={{ filter: filter }}
              src="/test.svg"
              alt="filtered test image"
            />
          </aside>
        </section>
        <aside>
          <pre id="filter">{filter.replaceAll('"', '&quot;')}</pre>
        </aside>
      </main>
    </>
  )
}

export default App
