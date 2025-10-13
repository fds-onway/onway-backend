# API OnWay
Este é o repositório que contém todo o código e configurações da API utilizada no projeto "OnWay".

---

## Tabela de conteúdos

- [Deploy da API](#deploy-da-api)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Padrões do projeto](#padrões-do-projeto)

---

## Deploy da API
O Deploy da API é extremamente simples uma vez que você tenha feito todos os passos documentados no [OnWay-Infra](https://github.com/fds-onway/onway-infra).
Simplesmente, uma vez configurado todos os **secrets** no repositório, popule o **`.env`** utilizando o .env.example como base, com os seguintes dados:
- **ENV**: "dev" ou "prod", para separar entre ambiente de desenvolvimento e produção (No secret "DOTENV_CONTENT" deixe este sempre como "prod")
- **DOCKER_USERNAME**: Seu username docker que você configurou nos secrets
- **POSTGRES_HOST**: Valor apenas utilizado em produção, é o nome do container que ficará o postgres
- **POSTGRES_USER**: Nome do usuário que será utilizado para acessar o banco de dados
- **POSTGRES_PASSWORD**: Senha do usuário mencionado anteriormente
- **POSTGRES_DB**: Nome da base de dados que a aplicação utilizará dentro do postgres
- **POSTGRES_PORT**: Dado apenas utilizado em desenvolvimento, é o número da porta que está o postgres
- **TOKEN_SECRET**: Uma string aleatória que servirá como chave de criptografia do JsonWebToken
---
Após popular, você precisará copiar o conteúdo exato do seu arquivo **.env** e colar no secret do GitHub chamado **DOTENV_CONTENT**, e vá em **Actions** -> **API Deploy** -> **Run Workflow**
Se você configurou tudo corretamente, o workflow funcionará e a API estará escutando no endereço configurado.

---

## Desenvolvimento Local

Para desenvolver localmente, você precisa ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose

Com o ambiente pronto, o processo é simples, você precisa fazer algumas configurações, mas nada muito complexo:

1. Popular o .env
Já explicado como fazer [no passo anterior](#deploy-da-api)

2. Subir o banco local
```bash
docker compose -f docker-compose.local.yaml up -d
```

3. Rodar e desenvolver
Apenas rode um:
```bash
npm start
```
E pode começar a desenvolver.

---

## Padrões do Projeto
Para você que deseja adicionar coisas na API, esta é uma lista de padrões que você deve seguir para se manter dentro das quatro linhas.

### Documentação

Essa é a parte mais importante de toda a API.
Nela, está configurado o **ReDoc** na rota `/docs`, que é reponsável por documentar toda a API para os desenvolvedores de Mobile e Web saber o que cada coisa faz
Para isso, foi criado essa lista de convenções para documentação:

1. **Todo campo de DTO deverá ter um @ApiProperty com exemplo**
O @ApiProperty é um decorator utilizado para dizer o que cada campo de um DTO serve/faz, pegue este exemplo para um campo de e-mail:
```typescript
@ApiProperty({
  required: true,
  example: 'test@example.com',
  description: 'O e-mail que será utilizado no cadastro',
})
email: string;
```

Toda vez que você desenvolver um DTO novo, ele deverá ter esse @ApiProperty em **cada um dos campos**, e com estes 3 dados utilizados no exemplo:
- **required**: para dizer se é opcional ou não
- **example**: um exemplo de como é o dado
- **description**: a descrição do dado
---
2. **Todas as rotas devem ser documentadas**
Como o nome já dizem se você criar uma rota nova, ela deverá ter o decorator **@ApiOperation** explicando o que ela faz, esse decorator literalmente só tem este objetivo.
Exemplo:
```typescript
@ApiOperation({ summary: 'Criar um novo usuário' })
create(@Body() createUserDto: CreateUserDto) {
  // ...
}
```

3. **Todas as respostas possíveis da rota devem ser documentadas**
Juntamente do **@ApiOperation**, tem o decorator **@ApiReponse**, que serve para documentar todas as respostas possíveis de uma rota.
Para cada rota nova que você criar, todas as respostas devem ser documentadas com estes decorators.
E obrigatóriamente, toda @ApiResponse deverá ter o campo "type" que aponta para o DTO de sua resposta. Ou seja, isso também obriga que cada resposta siga um DTO específico.
Exemplo completo com @ApiOperation e @ApiResponse:
```typescript
@ApiOperation({ summary: 'Criar um novo usuário' })
@ApiResponse({ status: 201, description: 'Usuário criado com sucesso.', type: CreatedUserDTO })
@ApiResponse({ status: 400, description: 'Dados inválidos.', type: ErrorDTO })
@ApiResponse({ status: 409, description: 'Usuário com o e-mail já existe.', type: ErrorDTO})
create(@Body() createUserDto: CreateUserDto) {
  // ...
}
```

4. **Todo Controller deverá ter um @ApiTags**
O @ApiTags é um decorator que serve para adicionar tags a um determinado controller, para que no `/docs` ele separe por categorias (categorias essas que são configuradas no `main.ts`)
Todo controller que você criar deverá ter ele.
Exemplo:
```typescript
@Controller()
@ApiTags('utils')
export class AppController {
  constructor() {}
}
```

### Acesso ao banco e operações
Esta é um pouco mais simples que a anterior:

1. **Todo acesso ao banco deverá ser pela classe DrizzleService**
Toda a parte de configuração de conexão com o banco de dados e coisa do tipo já está feita dentro da classe **DrizzleService**.
E a melhor parte é que ela tem o decorator @Injectable() nela, tornando fácil importar para sua biblioteca:
```typescript
export default class UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {} // <-- Isso já injeta automáticamente!
}
```

2. **Toda operação feita no banco deverá ser feita em um Repository**
Este projeto segue o padrão de projeto chamado **Repository**, onde, ao invés de ter várias classes diferentes em um banco, você tem uma central, que cuida de toda a parte do CRUD.
Exemplo para usuário:

```typescript
@Injectable() // <-- sempre adicione para depois o Nest poder injetar nas classes que a chamarem
export default class UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createUser(dto: CreateUserDTO): Promise<User> {
    const [createdUser] = await this.drizzleService.db.insert(user).values(dto).returning()
    return createdUser;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.drizzleService.db.delete(user).where(eq(user.id, userId));
  }
}
```

Aí como eles terão o **@Injectable** no service você poderá utilizar ele da seguinte forma:
```typescript
@Injectable()
export default class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  deleteUser(id: number) {
    return await this.userRepository.deleteUser(id);
  }
}
```
