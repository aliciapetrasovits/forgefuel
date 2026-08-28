const navigationButtons = document.querySelectorAll("nav button");
const pages= document.querySelectorAll(".page");
const workoutForm = document.getElementById("workout-form");
const workoutList = document.getElementById("workout-list");
const workoutCount = document.getElementById("workout-count");
const foodCount = document.getElementById("food-count");
const calorieTotal = document.getElementById("calorie-total");
const proteinTotal = document.getElementById("protein-total");
const carbsTotal = document.getElementById("carbs-total");
const fatTotal = document.getElementById("fat-total");

const foodDatabase = {
    "chicken-breast": {
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6
    }
};
navigationButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const pageId = button.dataset.page;
        navigationButtons.forEach(function(navigationButton){
            navigationButton.classList.remove("active");
        });
        button.classList.add("active");

        pages.forEach(function (page) {
            page.classList.remove("active");
        });

        const selectedPage = document.getElementById(pageId);
        selectedPage.classList.add("active");
    });
});
workoutForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const exercise = document.getElementById("exercise").value;
    const weight = document.getElementById("weight").value;
    const sets = document.getElementById("sets").value;
    const reps = document.getElementById("reps").value;

    const workout = { exercise, weight, sets, reps };
    workouts.push(workout);
    localStorage.setItem("forgefuelWorkoutsV2", JSON.stringify(workouts));
    displayWorkout(workout);
    updateDashboard();
    workoutForm.reset();
});

let workouts = JSON.parse(localStorage.getItem("forgefuelWorkoutsV2")) || [];

function displayWorkout(workout) {
    const workoutItem = document.createElement("li");
    workoutItem.textContent = `${workout.exercise}: ${workout.weight} kg, ${workout.sets} sets, ${workout.reps} reps`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.addEventListener("click", function () {
        const workoutIndex = workouts.indexOf(workout);
        if (workoutIndex > -1) {
            workouts.splice(workoutIndex, 1);
            localStorage.setItem("forgefuelWorkoutsV2", JSON.stringify(workouts));
            workoutItem.remove();
            updateDashboard();
        }
    });
    workoutItem.appendChild(deleteButton);
    workoutList.appendChild(workoutItem);
    const workoutCount = document.getElementById("workout-count");
    const foodCount = document.getElementById("food-count");
    const calorieTotal = document.getElementById ("calorie-total");
}

workouts.forEach(displayWorkout);

const foodForm = document.getElementById("food-form");
const foodList = document.getElementById("food-list");
let foods = JSON.parse(localStorage.getItem("forgefuelFoodsV2")) || [];

function displayFood(food) {
    const foodItem = document.createElement("li");
    foodItem.textContent = `${food.name}: ${food.calories} kcal, ${food.protein} g protein, ${food.carbs} g carbs, ${food.fat} g fat`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.addEventListener("click", function () {
        const foodIndex = foods.indexOf(food);
        if (foodIndex > -1) {
            foods.splice(foodIndex, 1);
            localStorage.setItem("forgefuelFoodsV2", JSON.stringify(foods));
            foodItem.remove();
            updateDashboard();
        }
    });

    foodItem.appendChild(deleteButton);
    foodList.appendChild(foodItem);
}

foods.forEach(displayFood);

foodForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("food-name").value;
    const quantity = document.getElementById("quantity").value;
    const calories = document.getElementById("calories").value;
    const protein = document.getElementById("protein").value;
    const carbs = document.getElementById("carbs").value;
    const fat = document.getElementById("fat").value;
    const food = { name, quantity, calories, protein, carbs, fat };

    foods.push(food);
    localStorage.setItem("forgefuelFoodsV2", JSON.stringify(foods));
    displayFood(food);
    updateDashboard();
    foodForm.reset();
});

const foodSelect = document.getElementById("food-name");
const quantityInput = document.getElementById("quantity");
const caloriesInput = document.getElementById("calories");
const proteinInput = document.getElementById("protein");
const carbsInput = document.getElementById("carbs");  
const fatInput = document.getElementById("fat");

function calculateNutrition() {
    const selectedFood = foodDatabase[foodSelect.value];
    const quantity = Number(quantityInput.value);
    
    if(!selectedFood || quantity <= 0) {
        caloriesInput.value = "";
        proteinInput.value = "";
        carbsInput.value = "";
        fatInput.value = "";
        return; 
    }
    const multiplier = quantity / 100;
    caloriesInput.value = (selectedFood.calories* multiplier).toFixed(1);
    proteinInput.value = (selectedFood.protein* multiplier).toFixed(1);
    carbsInput.value = (selectedFood.carbs* multiplier).toFixed(1);
    fatInput.value = (selectedFood.fat* multiplier).toFixed(1);

}  
foodSelect.addEventListener("change", calculateNutrition);
quantityInput.addEventListener("input", calculateNutrition);
function updateDashboard(){
    workoutCount.textContent = workouts.length;
    foodCount.textContent = foods.length;
    const totalCalories = foods.reduce(function (total,food){
        return total + Number (food.calories);
    }, 0);
    calorieTotal.textContent = totalCalories.toFixed(1);
    proteinTotal.textContent = foods
    .reduce((total,food) => total + Number(food.protein), 0)
    .toFixed(1)
    carbsTotal.textContent = foods
    .reduce((total,food) => total + Number(food.carbs), 0)
    .toFixed(1)
    fatTotal.textContent = foods
    .reduce((total,food) => total + Number(food.fat), 0)
    .toFixed(1)
}

updateDashboard();
const exportButton = document.getElementById("export-data");
exportButton.addEventListener("click", function(){
    const backup = {
        exportedAt: new Date().toISOString(),
        workouts: workouts,
        foods: foods
     };
     const file = new Blob(
        [JSON.stringify(backup, null, 2)],
        {type:"application/json"}
     );
     const downloadLink = document.createElement("a");
     downloadLink.href = URL.createObjectURL(file);
     downloadLink.download = "forgefuel-bacpup.json";

     URL.revokeObjectURL(downloadLink.href);

});
const importButton = document.getElementById("import-data-button");
const importInput = document.getElementById("import-data");
importButton.addEventListener("click", function () {
});
importInput.addEventListener("change",function () {
    const file = importInput.files[0];
    if (!file){
        return;
    }
    const reader = new FileReader();
    reader.addEventListener ("load", function() {
        try{
            const backup = JSON.parse(reader.result);
            if (!Array.isArray(backup.workouts)|| !Array.issArray(backup.foods)){
             throw new Error("Invalid backp");   
            }
            const confirmed = confirm(
                "Importing will replace your current Forgefuel data. Continue?"
            );
            if (!confiremed){
                return;
            }
            localStorage.setItem(
                "forgrfuelWorkoutsV2",
                JSON.stringify(backup.workouts)
            );
            localStorage.setItem(
                "forgefuelWorkoutsV2",
                JSON.stringify(backup.foods)
            );
            localStorage.reload();
        }catch{
            alert("This is not a valid ForgeFuel backup file.");
        }

    });
    reader.readAsText(file);
});
