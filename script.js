document.addEventListener("DOMContentLoaded", function(){

    const searchButton = document.getElementById("search_button");
    const userNameInput = document.getElementById("user_input");
    const statsContainer = document.querySelector(".stats_container");
    const easyProgressCircle = document.querySelector(".easy_progress");
    const mediumProgressCircle = document.querySelector(".medium_progress");
    const hardProgressCircle = document.querySelector(".hard_progress");
    const easyLabel = document.getElementById("easy_label");
    const mediumLabel = document.getElementById("medium_label");
    const hardLabel = document.getElementById("hard_label");
    const cardStatsContainer = document.querySelector(".stats_card");


    //return true or false on validation of username
    function validateUserName(username){
        if(username.trim() === ""){
            alert("Username should not be empty");
            return false;
        }

        const regex = /^[a-zA-Z0-9_]{1,15}$/;    //format of username
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }

    //api call function
    async function fetchUserDetails(username){
        try{

            searchButton.textContent = "searching..";
            searchButton.disabled = true;

          
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);


            if(!response.ok){
                throw new Error("Unable to the User Details");
            }
            const parsedData = await response.json();
            console.log("Logging Data : ", parsedData);

            displayUserData(parsedData);
        }

        catch(error){
            statsContainer.innerHTML = `<p>No Data Found</p>`

        }
        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;

        }

    }


          //WITHOUT ANIMANTION
    // function updateProgress(solved, total, label, circle){
    //     const progressDegree = (solved/total)*100;
    //     circle.style.setProperty("--progress-degree", `${progressDegree}%`);

    //     const percentage = Math.round(progressDegree);

    //     // ✅ BOTH percentage + count
    //       label.textContent = `${percentage}%\n(${solved}/${total})`;
          
    //       //only (10/100)
    //    // label.textContent = `${solved}/${total}`; 
    // }


    //WITH ANIMATION
    function updateProgress(solved, total, label, circle){
    let current = 0;
    const final = Math.round((solved / total) * 100);

    const interval = setInterval(() => {
        if(current >= final){
            clearInterval(interval);
        }

        circle.style.setProperty("--progress-degree", `${current}%`);
        label.textContent = `${current}%\n(${solved}/${total})`;

        current++;
    }, 15);
}


    function displayUserData(parsedData){
        const totalQuestion =parsedData.data.allQuestionsCount[0].count;
        const totalEasyQuestion =parsedData.data.allQuestionsCount[1].count;
        const totalMediumQuestion =parsedData.data.allQuestionsCount[2].count;
        const totalHardQuestion =parsedData.data.allQuestionsCount[3].count;


        const solvedTotalQuestion = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQuestion = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQuestion = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQuestion = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQuestion, totalEasyQuestion, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQuestion, totalMediumQuestion, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQuestion, totalHardQuestion, hardLabel, hardProgressCircle);


        const cardData = [
            {label: "Overall Submissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label: "Overall EasySubmissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label: "Overall MediumSubmissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label: "Overall HardSubmissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},
        ]

        console.log("Cards Data: ", cardData);

        cardStatsContainer.innerHTML = cardData.map(
            data => {
                return `
                <div class="card">
                <h4>${data.label}</h4>
                <p>${data.value}</p>
                </div>
                `
            }
        ).join("")



    }


    searchButton.addEventListener('click',function(){
        const username = userNameInput.value;
        console.log("Logging Username : ",username);
        if(validateUserName(username)){
            fetchUserDetails(username);

        }
    })
})