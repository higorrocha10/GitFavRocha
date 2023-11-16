import { GithubUser } from "./GithubUser.js"

// Clase que contiene la lógicas de los datos.
// Como los datos serás estructurados.

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  // Método para cargar los datos de la página.
  // PARSE() Modificar un JSON para un objeto que está dentro del JSON.
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  // Método para salvar todos los datos de la apliación en el localStorage.
  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  // Método para agregar usuarios y mensaje de error si usuario no existe.
  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username)

      if (userExists) {
        throw new Error("Usuário já cadastrado. ")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado. ")
      }

      this.entries = [user, ...this.entries] // Traer los elementos del array anterior y repartirlos en el nuevo array.
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  // Método para comparar las entradas y eliminar o no un usuário en el HTML.
  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )

    this.entries = filteredEntries // Agregando un nuevo ARRAY. INMUTABILIDAD
    this.update()
    this.save()
  }
}

// Clase que se encargará de la visualización y eventos del HTML.
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector(".favorites")

    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input")

      this.add(value)
    }
  }

  // Método para actualizar el HTML.
  update() {
    this.removeAllTr()
    this.emptyState()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`

      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user p").textContent = user.name
      row.querySelector(".user span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      // Agregando evento al botón de remover.
      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Estás seguro de eliminar este usuário?")

        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row) //append : añadir elementos al HTML.
    })
  }

  // Método crear líneas en el HTML (tabla exactamente).
  createRow() {
    const tr = document.createElement("tr")

    const content = `
            <td class="user">
              <img
                src="https://github.com/maykbrito.png"
              />
              <a href="https://github.com/maykbrito" target="_blank">
                <p>Mayk Brito</p>
                <span>/maykbrito</span>
              </a>
            </td>
            <td class="repositories">123</td>
            <td class="followers">1234</td>
            <td>
              <button class="remove">Remover</button>
            </td>
    `
    tr.innerHTML = content

    return tr
  }

  // Método para remover 'tr' del HTML.
  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove() //Removiendo 'tr' del HTML.
    })
  }

  // Método para ocultar DIV vácia si hay favoritos en la tabla.
  emptyState() {
    if (this.entries.length === 0) {
      this.root.querySelector(".empty-state").classList.remove("hide")
    } else {
      this.root.querySelector(".empty-state").classList.add("hide")
    }
  }
}
