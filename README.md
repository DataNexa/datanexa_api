# API DATANEXA
API dos serviços

## Criação de Conta

 - A criação da conta com e-mail e senha gera também um registro em `token_account` que é usado para versionamento das sessões, podendo ser expiradas acrecentando +1 ao campo `vtoken`

## Login

- Após usuário fazer login com e-mail e senha, é gerado um registro em `token_device_account` onde é criado e inserido um `hash_salt` e um `refresh_token`:
```
refresh_token = token_default + account_id + email + timestamp + 'refresh_token'
hash_salt     = token_default + account_id + email + timestamp + 'hash_salt'
```

## Gerar sessões

- As sessões são geradas usando o `refresh_token` da conta com a seguinte assinatura:

```
dadosUsuario = { ... }
assinatura   = dadosUsuario + hash_salt + vtoken
```
E desta forma que é verificada cada sessão. Se o `vtoken` for alterado ou o registro do `tokens_device_account` que contém o `hash_salt` for deletado, aquela sessão não será válida, mesmo que ela tenha sido criada anteriormente.

Ou seja, para expirar uma sessão basta:

- Acrescentar +1 ao `vtoken`, porém isso irá expirar todas as sessões da conta em todos os aparelhos.

- Deletar o registro em `tokens_device_account`, isso irá expirar todas as sessões que foram geradas pelo aparelho

## Ciclo de Vida

<img src="Ciclo_API.jpeg">

## Autenticação

<img src="Autentication.jpeg">

### banco de dados
<img src="AuthDB.jpeg">
