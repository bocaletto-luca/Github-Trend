 /**********************************************************
     * GitHub Trends Dashboard
     * ---------------------------------------------------------
     * This dashboard fetches trending GitHub repositories using
     * GitHub's search API. It lets the user filter by programming
     * language, keyword/topic, and creation date, then sorts by stars.
     * Results include repository name, description, language,
     * stars, forks, and link to the repository.
     **********************************************************/
    
    // Select DOM elements
    const languageInput = document.getElementById("languageInput");
    const topicInput = document.getElementById("topicInput");
    const createdAfterInput = document.getElementById("createdAfter");
    const searchBtn = document.getElementById("searchBtn");
    const resultsDiv = document.getElementById("results");

    // Add event listener to the search button
    searchBtn.addEventListener("click", function() {
      // Read filter values
      const language = languageInput.value.trim();
      const topic = topicInput.value.trim();
      const createdAfter = createdAfterInput.value;
      
      // Build the query string for the GitHub search API
      // Start with an empty query
      let query = "";
      
      // Add language filter if provided
      if (language) {
        query += `language:${language} `;
      }
      // Add topic/keyword filter - this appears in the repository description, name, etc.
      if (topic) {
        query += `${topic} `;
      }
      // Add created filter if provided
      if (createdAfter) {
        query += `created:>${createdAfter} `;
      }
      // Trim any extra white space in the query string
      query = query.trim();

      // If no query items given, default to a recent time period to get trending repos
      if (query === "") {
        // Default filter: created in the last 7 days
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 7);
        query = `created:>${defaultDate.toISOString().substr(0, 10)}`;
      }

      // Final API URL: sort by stars in descending order
      // We ask for 30 results per page (default)
      const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;
      
      // Debug: log the API URL
      console.log("API URL:", apiUrl);
      
      // Fetch data from GitHub REST API search endpoint
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok " + response.status);
          }
          return response.json();
        })
        .then(data => {
          // Render the results on the page
          displayResults(data.items);
        })
        .catch(error => {
          console.error("Error fetching repositories:", error);
          resultsDiv.innerHTML = `<p class="text-danger">Error fetching trending repositories. Please try again later.</p>`;
        });
    });

    /**
     * Display the repository results.
     * @param {Array} repos - Array of repository objects from GitHub API.
     */
    function displayResults(repos) {
      // Clear any previous results
      resultsDiv.innerHTML = "";
      
      // If no results, show a message
      if (!repos || repos.length === 0) {
        resultsDiv.innerHTML = `<p class="text-warning">No repositories found for this filter.</p>`;
        return;
      }
      
      // Loop through each repository object
      repos.forEach(repo => {
        // Create a Bootstrap card for each repository
        const colDiv = document.createElement("div");
        colDiv.className = "col-md-6 col-lg-4";
        
        const cardDiv = document.createElement("div");
        cardDiv.className = "card repo-card h-100";
        
        // Card body container
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        
        // Repository name as a clickable link
        const repoName = document.createElement("h5");
        repoName.className = "card-title";
        repoName.innerHTML = `<a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.full_name}</a>`;
        
        // Repository description (if available)
        const description = document.createElement("p");
        description.className = "card-text";
        description.textContent = repo.description || "No description available.";
        
        // Repository metadata: language, stars, forks
        const metadata = document.createElement("p");
        metadata.className = "card-text text-muted";
        metadata.innerHTML = `
          <small>
            ${repo.language ? `<strong>Language:</strong> ${repo.language} | ` : ""}
            <strong>Stars:</strong> ${repo.stargazers_count} | 
            <strong>Forks:</strong> ${repo.forks_count}
          </small>
        `;
        
        // Append repository information to card body
        cardBody.appendChild(repoName);
        cardBody.appendChild(description);
        cardBody.appendChild(metadata);
        
        // Append card body to card
        cardDiv.appendChild(cardBody);
        // Append card to column div
        colDiv.appendChild(cardDiv);
        // Append the column to the results container
        resultsDiv.appendChild(colDiv);
      });
    }
