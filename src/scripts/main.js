document.addEventListener('DOMContentLoaded', init, false);

let tableTbody = document.querySelector('#table tbody');
const pageSize = 50;
let curPage = 1;
let cars;
let arrayLength;

async function init() {
  const resp = await fetch('https://myfakeapi.com/api/cars/');
  const data = await resp.json();
  cars = data.cars;

  setData();
  renderTable(cars);

  document.querySelector('#prev-button').addEventListener('click', previousPage);
  document.querySelector('#next-button').addEventListener('click', nextPage);
};

function renderTable(cars) {
  let result = '';

  cars.filter((row, index) => {
    let start = (curPage - 1) * pageSize;
    let end = curPage * pageSize;

    if (index >= start && index < end) {
      return true;
    };
  }).forEach(element => {
    result += `<tr>
      <td>${element.car}</td>
      <td>${element.car_model}</td>
      <td>${element.car_vin}</td>
      <td>${element.car_color}</td>
      <td>${element.car_model_year}</td>
      <td>${element.price}</td>
      <td>${element.availability}</td>
      <td>
        <div class="table__dropdown dropdown">
          <button onclick="showEditDelete(${element.id})" class="dropdown__btn">Edit/Delete</button>
          <div id="dropdownOptions-${element.id}" class="dropdown__content">
            <button
              type="button"
              class="dropdown__open-modal-btn"
              onclick="openEditModal(${element.id})"
            >Edit
            </button>
            <button
            type="button"
              class="dropdown__open-modal-btn"
              onclick="openDeleteModal(${element.id})"
            >Delete
            </button>
          </div>
        </div>
      </td>
    </tr>`;
  });

  tableTbody.innerHTML = result;
}

function previousPage() {
  if (curPage > 1) {
    curPage--;
  }
  searchCar();
}

function nextPage() {
  if (!arrayLength) {
    searchCar();
  }

  if (curPage * pageSize < arrayLength) {
    curPage++;
  }
  searchCar();
}

function searchCar(event) {
  let input = document.getElementById("searchInput");
  let inputValue = input.value.toLowerCase();

  if (event) {
    curPage = 1;
  }

  let filteredCars = cars.filter((row) => {
    return row.car.toLowerCase().indexOf(inputValue) > -1
      || row.car_model.toLowerCase().indexOf(inputValue) > -1
      || row.car_vin.toLowerCase().indexOf(inputValue) > -1
      || row.car_color.toLowerCase().indexOf(inputValue) > -1
      || row.car_model_year.toString().indexOf(inputValue) > -1
      || row.price.toLowerCase().indexOf(inputValue) > -1
      || row.availability.toString().toLowerCase().indexOf(inputValue) > -1;
  });

  arrayLength = filteredCars.length;

  renderTable(filteredCars);
}

function showEditDelete(id) {
  document.getElementById(`dropdownOptions-${id}`).classList.toggle("dropdown__content--show");
}

window.onclick = function (event) {
  if (!event.target.matches('.dropdown__btn')) {
    const dropdowns = document.getElementsByClassName("dropdown__content");
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('dropdown__content--show')) {
        openDropdown.classList.remove('dropdown__content--show');
      }
    }
  }

  const modal = document.querySelector('.modal');

  if (event.target == modal) {
    closeModal();
  }
}

function setData() {
  for (let i = 0; i < localStorage.length; i++) {
    let searchedCarId = cars.findIndex(car => car.id === JSON.parse(localStorage.getItem(localStorage.key(i))).id)

    if (localStorage.key(i).includes('add')) {
      cars.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
    } else if (localStorage.key(i).includes('edit')) {
      cars[searchedCarId] = JSON.parse(localStorage.getItem(localStorage.key(i)));
    } else if (localStorage.key(i).includes('delete')) {
      cars.splice(searchedCarId, 1);
    }
  }
}

function openEditModal(carId) {
  let editedCar = cars.findIndex(car => car.id === carId);
  const modal = document.querySelector('.modal');

  modal.style.display = "block";

  modal.insertAdjacentHTML('beforeend', `
  <div class="modal__content">
    <form class="modal__form">
      <input
        type="text"
        name="car"
        class="modal__form-input--disabled"
        value="${cars[editedCar].car}"
        placeholder="Company"
        disabled
      >

      <input
        type="text"
        name="model"
        class="modal__form-input--disabled"
        value="${cars[editedCar].car_model}"
        placeholder="Model"
        disabled
      >

      <input
        type="text"
        name="vin"
        class="modal__form-input--disabled"
        value="${cars[editedCar].car_vin}"
        placeholder="VIN}"
        disabled
      >

      <input
        type="text"
        name="color"
        class="modal__form-input"
        value="${cars[editedCar].car_color}"
        placeholder="Color"
      >

      <input
        type="number"
        name="year"
        class="modal__form-input--disabled"
        min="1900"
        max="2099"
        step="1"
        value="${cars[editedCar].car_model_year}"
        disabled
      >

      <input
        type="text"
        name="price"
        class="modal__form-input"
        value="${cars[editedCar].price}"
        placeholder="price"
      >

      <div class="modal__form-availability-input">
      Availability:
        <div class="modal__form-availability-input--choices">
          <label>
            <input
              type="radio"
              name="availability"
              value="True"
            >True
          </label>
          <label>
            <input
              type="radio"
              name="availability"
              value="False"
            >False
          </label>
        <div>
      </div>

      <button
        type="submit"
        class="modal__form-btn"
        onclick="editCar(event, ${editedCar}, ${carId})"
      >Save changes
      </button>

      <button
        type="button"
        onclick="closeModal()"
        class="modal__form-btn"
      >Cancel
      </button>
    </form>
  </div>`)
}

function editCar(event, carIndex, carId) {
  event.preventDefault();
  const form = document.querySelector('.modal__form');

  cars[carIndex].car_color = form.color.value;
  cars[carIndex].price = form.price.value;
  cars[carIndex].availability = form.availability.value;

  localStorage.setItem(`edit-${carId}`, JSON.stringify(cars[carIndex]));

  setData();
  renderTable(cars);

  closeModal();
}

function openDeleteModal(carId) {
  let carIndex = cars.findIndex(car => car.id === carId);

  const modal = document.querySelector('.modal');

  modal.style.display = "block";

  modal.insertAdjacentHTML('beforeend', `
    <div class="modal__content">
      <p>Are you sure you want to delete this car?</p>

      <button
        class="modal__btn"
        type="button"
        onclick="deleteCar(${carIndex}, ${carId})"
      >Yes
      </button>

      <button
        class="modal__btn"
        type="button"
        onclick="closeModal()"
      >No
      </button>
    </div>`)
}

function deleteCar(carIndex, carId) {
  let [deleted] = cars.splice(carIndex, 1);

  localStorage.setItem(`delete-${carId}`, JSON.stringify(deleted));

  renderTable(cars);

  closeModal();
}

const addCarBtn = document.querySelector('.add-car-btn');
addCarBtn.addEventListener('click', openAddModal);

function openAddModal(event) {
  event.preventDefault();
  const modal = document.querySelector('.modal');

  modal.style.display = "block";

  modal.insertAdjacentHTML('beforeend', `
  <div class="modal__content">
    <form class="modal__form">
      <input
        type="text"
        name="company"
        class="modal__form-input"
        placeholder="Company"
      >

      <input
        type="text"
        name="model"
        class="modal__form-input"
        placeholder="Model"
      >

      <input
        type="text"
        name="vin"
        class="modal__form-input"
        placeholder="VIN"
      >
      <input
        type="text"
        name="color"
        class="modal__form-input"
        placeholder="Color"
      >
      <input
        type="number"
        name="year"
        class="modal__form-input"
        placeholder="2000"
        min="1900"
        max="2099"
        step="1"
      >

      <input
        type="text"
        name="price"
        class="modal__form-input"
        placeholder="price"
      >

      <div class="modal__form-availability-input">
      Availability:
        <div class="modal__form-availability-input--choices">
          <label>
            <input
              type="radio"
              name="availability"
              value="True"
            >True
          </label>
          <label>
            <input
              type="radio"
              name="availability"
              value="False"
            >False
          </label>
        <div>
      </div>

      <button
        class="modal__form-btn"
        type="submit"
        onclick="addCar(event)"
      >Add car
      </button>

      <button
        class="modal__form-btn"
        type="reset"
        onclick="clearForm()"
      >Clear all fields
      </button>

      <button
        class="modal__form-btn"
        type="button"
        onclick="closeModal()"
      >Cancel
      </button>
    </form>
  </div>`)
}

function addCar(event) {
  event.preventDefault();

  const form = document.querySelector('.modal__form');
  let lastCar = Math.max(...cars.map(car => car.id));

  const newCar = {
    "id": lastCar + 1,
    "car": form.company.value,
    "car_model": form.model.value,
    "car_color": form.color.value,
    "car_model_year": form.year.value,
    "car_vin": form.vin.value,
    "price": `$${form.price.value}`,
    "availability": form.availability.value,
  }

  localStorage.setItem(`add-${newCar.id}`, JSON.stringify(newCar));

  cars.push(newCar);
  // setData();
  renderTable(cars)

  const modal = document.querySelector('.modal');
  const modalContent = document.querySelector('.modal__content');
  modalContent.remove();
  modal.style.display = "none";
}

function clearForm() {
  document.querySelector('.modal__form').reset();
}

function closeModal() {
  const modal = document.querySelector('.modal');
  const modalContent = document.querySelector('.modal__content');
  modalContent.remove();
  modal.style.display = "none";
}
