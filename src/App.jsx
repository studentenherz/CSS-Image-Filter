import { useEffect, useState } from 'react'
import './App.css'
import { calculateMatrix } from './util'

const TEMPLATE = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="background_color_filter" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="{}"/></filter></defs></svg>#background_color_filter')`

function App() {
  const [colors, setColors] = useState([
    { from: '#ffffff', to: '#252727', id: 0, active: true },
    { from: '#000000', to: '#d1f2fa', id: 1, active: true },
    { from: '#ff0000', to: '#ff0000', id: 2, active: true },
    { from: '#00ff00', to: '#00ff00', id: 3, active: true },
    // { from: '#00ffff', to: '#00ffff', id: 4, active: false },
  ])
  const [filter, setFilter] = useState(TEMPLATE)
  const [nullspace, setNullspace] = useState([])
  const [ans, setAns] = useState([])
  const [replaceQuotes, setReplaceQuotes] = useState(false)

  useEffect(() => {
    console.log(colors)
    if (colors.length > 0) {
      const { ans, nullspace } = calculateMatrix(colors.filter((x) => x.active))
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
        <section className="images">
          <aside>
            <h2>Original</h2>
            <img
              src="https://imgs.xkcd.com/comics/automation.png"
              alt="test image"
            />
          </aside>
          <aside>
            {colors.map(({ from, to, id, active }) => (
              <div className="colormap" key={id}>
                <input
                  onChange={onChangeFromColorGenerator(id)}
                  type="color"
                  value={from}
                  disabled={!active}
                />

                {active ? '→ ' : 'x'}
                <input
                  onChange={onChangeToColorGenerator(id)}
                  type="color"
                  disabled={!active}
                  value={to}
                />
              </div>
            ))}
          </aside>
          <aside>
            <h2>Filtered</h2>
            <img
              style={{ filter: filter }}
              src="https://imgs.xkcd.com/comics/automation.png"
              alt="filtered test image"
            />
          </aside>
        </section>
        <section>
          <pre id="filter">
            {replaceQuotes ? filter.replaceAll('"', '&quot;') : filter}
          </pre>
          <button onClick={newFilter}>New combination</button>
          <button
            onClick={() => {
              setReplaceQuotes(!replaceQuotes)
            }}
          >
            {`Toggle "" and &quot;`}
          </button>
        </section>
      </main>
    </>
  )
}

export default App
