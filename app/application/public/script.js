const serverUrl = "/api"; // Grace a traefik et que ils sont sur la meme addresse ils peuvent communiquer directement.

/**
 * @type {{processId: number, hostname: string}[]}
 */
const servers = [];
let instances = 0;

window.addEventListener("load", () => {
    const resultBox = document.getElementById("result-box");
    const button = document.querySelector("button");

    button.addEventListener("click", async () => {
        try {
            
            const response = await fetch(`${serverUrl}/process-id`);
            /** @type {{processId: string, hostname: string}} */
            const data = await response.json();

            
            /** @type {HTMLDivElement[] | undefined | null} */
            const resultBoxItems = resultBox.querySelectorAll("#result-box div.item");

            if(data && servers.some(item => item.processId === data.processId && item.hostname === data.hostname)){
                resultBoxItems.forEach(item => {
                    if(String(item.dataset.processId) === String(data.processId) && item.querySelector("span:nth-of-type(2)").textContent === String(data.hostname)){
                        item.classList.add("active");
                    }else{
                        item.classList.remove("active");
                    }
                });
            }else{
                const newItem = document.createElement("div");
                newItem.className = "item active";
                newItem.dataset.processId = data.processId;

                const processIdEl = document.createElement("span");
                processIdEl.textContent = `instance ${++instances} - PID: ${data.processId}`;
                
                const hostnameEl = document.createElement("span");
                hostnameEl.textContent = data.hostname;

                const reponseStatusBox = document.createElement("span");

                [processIdEl, hostnameEl, reponseStatusBox].forEach(el => {
                    newItem.appendChild(el);
                });

                if(resultBoxItems && resultBoxItems.length > 0) resultBoxItems.forEach(item => {item.classList.remove("active")});
                resultBox.appendChild(newItem);

                servers.push(data);
            }
        
        } catch (error) {
            console.error("Error fetching process ID:", error);
        }
    });
});
