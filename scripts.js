
        const searchButton = document.getElementById('searchButton');
        const searchInput = document.getElementById('searchInput');
        const resultsdiv = document.getElementById('results');

        searchButton.addEventListener('click', searchRecipes);
        
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchRecipes();
            }
        });

        function searchRecipes() {
            const query = searchInput.value.trim();
            if (!query) {
                alert('Please enter a search term.');
                return;
            }
            const apiKey = '630b5e97ed354669b98399e73eb7e514';
            const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&addRecipeInformation=true&apiKey=${apiKey}`;

            resultsdiv.innerHTML = '<div class="loading">Loading recipes...</div>';

            //Call the spoonacular API
            fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                //clear the placeholder text
                resultsdiv.innerHTML = '';
                if (!data.results || data.results.length === 0) {
                    resultsdiv.innerHTML = '<div class="no-results">No recipes found. Please try a different search term.</div>';
                    return;
                }

                //Loop through each recipe result
                data.results.forEach(recipe => {
                    //Extract data we need
                    const title = recipe.title;
                    const image = recipe.image;
                    const id = recipe.id;

                    //Fetch nutrition data for this recipe using its ID
                    const nutritionUrl = `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${apiKey}`;
                    
                    fetch(nutritionUrl)
                    .then(response => response.json())
                    .then(nutritionData => {
                        let calories = 'N/A', protein = 'N/A', fat = 'N/A', carbs = 'N/A';
                        
                        if (nutritionData && nutritionData.nutrients) {
                            const nutrients = nutritionData.nutrients;
                            const calInfo = nutrients.find(n => n.name === 'Calories');
                            const proteinInfo = nutrients.find(n => n.name === 'Protein');
                            const fatInfo = nutrients.find(n => n.name === 'Fat');
                            const carbsInfo = nutrients.find(n => n.name === 'Carbohydrates');
                            
                            if (calInfo) calories = Math.round(calInfo.amount) + ' ' + calInfo.unit;
                            if (proteinInfo) protein = Math.round(proteinInfo.amount) + ' ' + proteinInfo.unit;
                            if (fatInfo) fat = Math.round(fatInfo.amount) + ' ' + fatInfo.unit;
                            if (carbsInfo) carbs = Math.round(carbsInfo.amount) + ' ' + carbsInfo.unit;
                        }

                        displayRecipe(title, image, calories, protein, fat, carbs);
                    })
                    .catch(error => {
                        console.error('Error fetching nutrition data:', error);
                        displayRecipe(title, image, 'N/A', 'N/A', 'N/A', 'N/A');
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                resultsdiv.innerHTML = '<div class="error">An error occurred while fetching recipes. Please try again.</div>';
            });
        }

        function displayRecipe(title, image, calories, protein, fat, carbs) {
            //Create a container div for this recipe
            const recipeDiv = document.createElement('div');
            recipeDiv.className = 'recipe';

            //Build the inner HTML for the recipe (image, title, and nutrition info)
            recipeDiv.innerHTML = `
                <h3>${title}</h3>
                <img src="${image}" alt="${title}">
                <p><strong>Calories:</strong> ${calories}</p>
                <p><strong>Protein:</strong> ${protein}</p>
                <p><strong>Fat:</strong> ${fat}</p>
                <p><strong>Carbohydrates:</strong> ${carbs}</p>
            `;

            //Append this recipe's HTML to the results container
            resultsdiv.appendChild(recipeDiv);
        }