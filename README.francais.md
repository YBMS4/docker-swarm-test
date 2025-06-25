# Docker Swarm Testing

Dans ce repository, vous retrouverez mon test de déploiement en environnement **Test** et **Production** avec Docker Compose et Docker Swarm. En tant que développeur Fullstack, la maîtrise de ces outils puissants est indispensable.

Vous y trouverez une brève description de ces deux outils et comment tirer avantage de chacun, accompagnée de petites applications afin que vous puissiez les tester.

Avant de commencer à utiliser le code de ce repository, il est important d’avoir **Docker Engine** installé.

## Docker Compose

Docker Compose est un petit orchestrateur Docker inclus par défaut avec l'installation de **Docker Engine**. Il est parfait pour un environnement de développement, mais peut également être utilisé en production. Toutefois, la **scalabilité** y est plus complexe.

Vous pouvez utiliser Docker Compose pour de petites applications qui ne nécessitent pas beaucoup de ressources, de configuration ou de scalabilité. Il fera parfaitement l’affaire dans ce cas.

Nous l'utiliserons ici pour **builder** nos images et les tester.  
Pour plus d'informations sur **Docker Compose**, visitez la [documentation officielle de Docker Compose](https://docs.docker.com/compose/)

## Docker Swarm

On parle moins souvent de Docker Swarm que de **Kubernetes**, qui domine le marché. Pourtant, Docker Swarm est tout aussi puissant et simple à utiliser. C’est un orchestrateur Docker très performant, plus puissant que Compose, tout en étant plus manuel.

Swarm est idéal lorsque votre architecture n’est pas très complexe ou quand un certain niveau d'automatisation est requis. Contrairement à Kubernetes où tout est automatisé via de nombreux modules et librairies, Docker Swarm reste plus simple à configurer.

Avec Docker Swarm, vous pouvez ajouter plusieurs serveurs au **Swarm** afin de les placer en **mode cluster**, avec plusieurs **nœuds managers** et **slaves**, pour un environnement hautement disponible et résilient. Grâce aux **registry** locaux ou distants (DockerHub), vous pouvez synchroniser les images sur tous les nœuds.

Nous l'utiliserons pour tester la **haute disponibilité** de notre back-end.

Pour plus d'informations sur **Docker Engine** et le **mode Swarm**, visitez la [documentation officielle](https://docs.docker.com/engine/swarm/)

## Images utilisées

1) **registry & registry-ui**  
   Utilisées pour mettre en place un registry Docker.

2) **Traefik**  
   Un serveur proxy très puissant qui sera utilisé pour rediriger les requêtes vers le bon service, en fonction des `ports`, `path` et `pathPrefix`.

3) **prometheus** et ses **exporters**  
   Prometheus est un serveur de collecte de métriques permettant de monitorer les ressources du système, des services et des applications.  
   Dans ce test, nous utiliserons ces 3 exporters :
   - `node_exporter` : pour récupérer les métriques de l’OS (Id pour importation dans grafana : *1860*).
   - `CAdvisor` : pour récupérer les métriques du Docker daemon (Id pour importation dans grafana : *19792* ou *1229*).
   - `prometheus` : pour ses propres métriques (Dashboard à importé dans grafana: *Prometheus 2.0 Stats*).

4) **grafana**  
   Si Prometheus collecte les métriques, Grafana les affiche via une interface web intuitive et riche. Elle permet de créer des **dashboards**, des alertes et de visualiser les performances du système. Ils sont donc complémentaires.

5) **node:24-alpine**  
   Cette image utilise Alpine, un OS Linux minimaliste, et y installe Node.js pour pouvoir exécuter du code Node.js.  
   Elle sera utilisée pour héberger nos front-end et back-end.

## Déploiement et tests

Pour tout tester, nous allons d'abord installer Docker Engine.  
Ensuite, nous mettrons en place le registry (facultatif mais éducatif et important), puis nous déploierons le dossier `app/` avec **Docker Compose**, puis avec **Docker Swarm (stack)**.

Après déploiement, testez via le navigateur :

- Notre application web sur le port `:80`
- Le dashboard de Traefik sur le port `:8080`
- Prometheus sur `:81/prometheus`
- Grafana sur `:81/grafana`

**Bonus**
- Dashboard du registry via registry-ui (si déployé) sur le port `5050`

Utilisez les IDs suivants dans Grafana pour visualiser les métriques :
- node_exporter : **1860**
- CAdvisor : **193**

### Déploiement avec Docker Compose

Après avoir cloné ce repository, rendez-vous dans `app/`, puis explorez un peu le code.  
Le fichier `compose.yaml` contient la configuration pour le déploiement avec Docker Compose.  
Si tout est prêt, exécutez simplement la commande suivante :

```sh
docker compose -p fullapp-compose up -d
```

- `-d` : détachement (lancer en arrière-plan)
- `-p` : nom du projet (par défaut, il prend le nom du dossier parent)

Une fois déployé, vous pouvez tester dans le navigateur avec l’adresse IP de la machine, les bons **ports** (très important) et **pathPrefix**.

### Déploiement en mode Swarm

Déployons maintenant l’architecture avec Swarm, toujours dans le dossier `app/`.  
Ici, nous utiliserons le fichier `swarm-compose.yaml` (la configuration diffère légèrement).

0. **Arrêter Compose** pour éviter les conflits de ports :

```sh
docker compose -p fullapp-compose down
```

1. Initialiser le **mode Swarm** (non activé par défaut) :

```sh
docker swarm init
```

2. Mettre en place le registry :  
   Deux méthodes possibles (manuelle ou avec `registry-compose.yaml` dans `registry/`).

**Méthode 1 – Manuelle :**

```sh
docker service create --name repository --publish published=5000,target=5000 registry:2 -d
```

Tester :

```sh
curl http://127.0.0.1:5000/v2
```

Résultat :

```sh
{}
```

**Méthode 2 – Déploiement dynamique :**  
Rendez-vous dans `registry/`, puis :

**Important :** Ouvrez `registry-compose.yaml` et modifiez uniquement les adresses IP indiquées en commentaire avec celle de votre serveur.  
N’utilisez **pas d'autres ports** sauf si nécessaire, auquel cas adaptez toute la configuration.

Si votre environnement Docker et votre navigateur de test sont sur la même machine, vous pouvez utiliser `localhost` ou `127.0.0.1`.

```sh
docker stack deploy --compose-file registry-compose.yaml registry-stack -d
```

Tester :

```sh
curl http://127.0.0.1:5000/v2
```

ou

```sh
curl http://<ip-server>:5000/v2
```

Résultat :

```sh
{}
```

Accéder à `registry-ui` :
- En local : `http://localhost:5050/`
- Hôtes différents : `http://<ip-server>:5050/`

3. Construire et pousser les images :  
   Retournez dans `app/` et exécutez le script `tagAndPushToRegistry.sh` :

```sh
bash "tagAndPushToRegistry.sh"
```

**Ce que fait le script :**
- Build des images front-end et back-end avec les Dockerfile et `compose.yaml`
- Tag des images sous la forme : `127.0.0.1:5000/<img-name>:latest`
- Push vers le registry pour synchronisation entre les nœuds du Swarm

4. Déployer avec Swarm :

```sh
docker stack deploy -c swarm-compose.yaml fullapp-stack -d
```

Vérifier les services :

```sh
docker stack services fullapp-stack
```

Si vous voyez des réplicas `n/n`, le service est lancé. Si `0/n`, il n’a pas démarré.

#### Tests du mode Swarm

1) Tester **Traefik** :  
   `http://<ip-server>:8080/`

2) Tester **Prometheus** :  
   `http://<ip-server>:81/prometheus/`

3) Tester **Grafana** :  
   `http://<ip-server>:81/grafana/`

   - Identifiant par défaut: `admin`
   - Mot de passe par défaut: `admin`
   - Source de données : `http://prometheus:9090/`

   Créez un dashboard avec les **IDs des exporters** mentionnés plus haut.

4) Tester la **réplication** et la **redondance** :  
   Accédez au front-end via : `http://<ip-server>:80/`,  
   Cliquez plusieurs fois sur le bouton pour voir les différentes instances du back-end répondre tour à tour.

### Remarque importante :
Ce projet est avant tout un test technique et un aperçu pédagogique de la conteneurisation avec Docker, Docker Compose et Docker Swarm. Il a pour but de vous familiariser avec les concepts, la syntaxe et les outils liés à ces technologies.

Dans un contexte réel ou en production, plusieurs aspects doivent être renforcés, notamment en matière de sécurité, de gestion des secrets, de scalabilité avancée, de CI/CD, de surveillance à grande échelle et de résilience réseau. Ce projet reste volontairement simple pour des fins de démonstration.

---

**Enfin, Si vous êtes arrivé jusqu’ici, merci !**
