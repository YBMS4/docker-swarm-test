# Docker Swarm Testing

***Veuillez utiliser le fichier ``README.francais.md`` si vous préférez la version francaise de ces explications.***

In this repository, you'll find my deployment tests for both **Test** and **Production** environments using Docker Compose and Docker Swarm. As a Fullstack developer, mastering these powerful tools is essential.

This includes a brief overview of both tools and how to leverage each, along with small sample applications for testing purposes.

Before using the code in this repository, make sure you have **Docker Engine** installed.

## Docker Compose

Docker Compose is a lightweight Docker orchestrator included by default with **Docker Engine**. It's ideal for development environments and can also be used in production, although **scalability** can be more challenging.

You can use Docker Compose for small applications that don't require a lot of resources, configuration, or high scalability. In such cases, it does the job perfectly.

Here, we will use it to **build** and test our images.  
For more information on **Docker Compose**, visit the [official Docker Compose documentation](https://docs.docker.com/compose/).

## Docker Swarm

Docker Swarm is often overlooked in favor of **Kubernetes**, which dominates the market. However, Docker Swarm is equally powerful and much simpler to use. It's a strong orchestrator, more powerful than Compose, while remaining more manual.

Swarm is ideal for architectures that aren't very complex or where some level of automation is required. Unlike Kubernetes, where everything is automated using various modules and libraries, Docker Swarm is more straightforward to configure.

With Docker Swarm, you can add multiple servers to a **Swarm cluster**, with multiple **manager nodes** and **workers**, enabling high availability and fault tolerance. With **local or remote registries** (such as DockerHub), you can synchronize images across all nodes.

We will use it to test the **high availability** of our back-end.

For more information on **Docker Engine** and **Swarm mode**, visit the [official documentation](https://docs.docker.com/engine/swarm/).

## Images Used

1) **registry & registry-ui**  
   Used to set up a Docker registry.

2) **Traefik**  
   A powerful reverse proxy that will handle routing requests to the correct service based on `ports`, `path`, and `pathPrefix`.

3) **prometheus** and its **exporters**  
   Prometheus is a metrics collection server used to monitor system, service, and application performance.  
   For this test, we will use 3 exporters:
   - `node_exporter`: collects OS-level metrics (Grafana Import Id: *1860*).
   - `CAdvisor`: collects Docker daemon metrics (Grafana Import Id: *19792* or *1229*).
   - `prometheus`: exposes its own metrics (Dashboard to import in Grafana: *Prometheus 2.0 Stats*).

4) **grafana**  
   While Prometheus collects the data, Grafana visualizes it using its rich and intuitive web interface. It allows creating **dashboards**, setting up alerts, and tracking system and service performance.

5) **node:24-alpine**  
   This image uses Alpine Linux (a minimal OS) and installs Node.js to run Node.js applications.  
   We'll use it to host our front-end and back-end apps.

## Deployment and Testing

To test everything, we will first set up Docker Engine.  
Then, we’ll configure the registry (optional but educational), and deploy the `app/` directory using **Docker Compose**, then again using **Docker Swarm (stack)**.

After deployment, test in your browser:

- Web app on port `:80`
- Traefik dashboard on port `:8080`
- Prometheus on `:81/prometheus`
- Grafana on `:81/grafana`

**Bonus**
- Registry UI dashboard (if deployed) on port `:5050`

In Grafana, use the following IDs to import dashboards for the exporters:
- node_exporter: **1860**
- CAdvisor: **193**

### Deployment with Docker Compose

After cloning this repository, go to the `app/` folder and explore the code.  
The `compose.yaml` file contains the configuration for Docker Compose deployment.  
If everything looks good, simply run:

```sh
docker compose -p fullapp-compose up -d
```

- `-d`: detached mode (runs in background)
- `-p`: sets the project name (defaults to parent directory name)

Once deployed, test in your browser using the server’s IP address and the correct **ports** and **pathPrefix**.

### Deployment with Swarm Mode

Now let’s deploy the architecture using Swarm mode, still inside the `app/` folder.  
We’ll use the `swarm-compose.yaml` file (slightly different from Compose format).

0. **Stop the Compose deployment** to avoid port conflicts:

```sh
docker compose -p fullapp-compose down
```

1. Initialize **Swarm mode** (not enabled by default):

```sh
docker swarm init
```

2. Set up the registry:  
   Two methods are available (manual or via `registry-compose.yaml` inside `registry/`).

**Method 1 – Manual:**

```sh
docker service create --name repository --publish published=5000,target=5000 registry:2 -d
```

Test it:

```sh
curl http://127.0.0.1:5000/v2
```

Expected result:

```sh
{}
```

**Method 2 – Dynamic Deployment:**  
Go to the `registry/` directory, then:

**Important:** Edit the `registry-compose.yaml` file and replace only the IP addresses (as marked in comments) with your server IP.  
Keep the same ports unless you plan to change the configuration accordingly.

If Docker and your test browser are on the same machine, you can use `localhost` or `127.0.0.1`.

```sh
docker stack deploy --compose-file registry-compose.yaml registry-stack -d
```

Test the registry:

```sh
curl http://127.0.0.1:5000/v2
```

or

```sh
curl http://<ip-server>:5000/v2
```

Expected result:

```sh
{}
```

Access the registry UI:
- Local: `http://localhost:5050/`
- Remote: `http://<ip-server>:5050/`

3. Build and push images:  
Go back to the `app/` folder and run the script `tagAndPushToRegistry.sh`:

```sh
bash "tagAndPushToRegistry.sh"
```

**What the script does:**
- Builds front-end and back-end images from Dockerfiles and `compose.yaml`
- Tags them using the registry URL: `127.0.0.1:5000/<img-name>:latest`
- Pushes them to the registry for synchronization across all Swarm nodes

4. Deploy with Swarm:

```sh
docker stack deploy -c swarm-compose.yaml fullapp-stack -d
```

Check the services:

```sh
docker stack services fullapp-stack
```

If replicas show `n/n`, the service is running. If `0/n`, it failed to start.

#### Swarm Mode Tests

1) Test **Traefik**:  
   `http://<ip-server>:8080/`

2) Test **Prometheus**:  
   `http://<ip-server>:81/prometheus/`

3) Test **Grafana**:  
   `http://<ip-server>:81/grafana/`

   - Default Username: `admin`
   - Default Password: `admin`
   - Data source: `http://prometheus:9090/prometheus`

   Use the exporter dashboard IDs listed above.

4) Test **replication** and **redundancy**:  
   Go to `http://<ip-server>:80/` in your browser.  
   Click the action button repeatedly and observe different back-end instances responding in turn.


### Important Note:

This project is primarily a technical test and a learning preview of containerization using Docker, Docker Compose, and Docker Swarm. It is meant to help you get familiar with the concepts, syntax, and tooling around these technologies.

In a real-world or production context, several critical aspects must be strengthened — including security, secret management, advanced scalability, CI/CD, large-scale monitoring, and network fault tolerance. This project is intentionally simplified for demonstration purposes.

**Anyways, If you made it this far, thank you!**
