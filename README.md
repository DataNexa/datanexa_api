# API DATANEXA
API dos serviços

## Criação de Conta

 - A criação da conta com e-mail e senha gera também um registro em `token_account` que é usado para versionamento das sessões, podendo ser expiradas acrecentando +1 ao campo `vtoken`

## Login

- Após usuário fazer login com e-mail e senha, é gerado um registro em `token_device_account` onde é criado e inserido um `hash_salt` e um `refresh_token`:
```typescript
const refresh_token = token_default + account_id + timestamp + 'refresh_token' // sha512
const hash_salt     = token_default + account_id + timestamp + 'hash_salt' // sha256
```

## Gerar Sessões

- As sessões são geradas usando o `refresh_token` da conta com a seguinte assinatura:

```typescript
const dadosUsuario = { ... } // usando interface user_i
const assinatura   = dadosUsuario + hash_salt + vtoken
```
E desta forma que é verificada cada sessão. Se o `vtoken` for alterado ou o registro do `tokens_device_account` que contém o `hash_salt` for deletado, aquela sessão não será válida, mesmo que ela tenha sido criada anteriormente.

Ou seja, para expirar uma sessão basta:

- Acrescentar +1 ao `vtoken`, porém isso irá expirar todas as sessões da conta em todos os aparelhos.

- Deletar o registro em `tokens_device_account`, isso irá expirar todas as sessões que foram geradas pelo aparelho

## Verificação de Sessões

Usando o `token_device_id` que é recuperado no JWT, selecionamos no banco de dados o `vtoken` e o `hash_salt` para comparação de assinatura:

```typescript
const dadosUsuario     = { ... } // usando interface user_i
const assinatura_test  = dadosUsuario + hash_salt + vtoken

const jwt = "fdasfdaaffd.adsffdsadfsdsfafdas.hdslkdsjoifd33h98y7fdkjajksa2398498"
//                                          |___________________________________|
//                                                            |
//                                                        assinatura
const assinatura = jwt.split(".")[2]
if (assinatura_test == assinatura){
    // sessão é válida
}
```

## Ciclo de Vida

<img src="Ciclo_API.jpeg">

## Autenticação

<img src="Autentication.jpeg">

### banco de dados
<img src="AuthDB.jpeg">
