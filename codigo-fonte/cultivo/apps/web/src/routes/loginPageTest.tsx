import { createFileRoute } from '@tanstack/react-router'
import { Link } from 'lucide-react';

export const Route = createFileRoute('/loginPageTest')({
  component: LoginComponent,
})

function LoginComponent() {
  return (
    <div className="container">
      <div className="card">
        <div style={{display:"flex", justifyContent:"center", marginBottom:12}}>
          <img src="/logo.svg" alt="Cultivo do Bem" style={{height:72}} onError={(e)=>((e.target as HTMLImageElement).style.display="none")} />
        </div>
        <h1>Acessar Conta</h1>
        <form className="form" onSubmit={(e)=>{ e.preventDefault(); nav("/cadastro"); }}>
          <label className="label">Email</label>
          <input className="input" placeholder="seuemail@exemplo.com" type="email"/>

          <label className="label">Senha</label>
          <input className="input" placeholder="Sua senha" type="password"/>

          <div style={{textAlign:"right", marginTop:4}}>
            <a className="link" href="#">Esqueceu sua senha?</a>
          </div>

          <button className="btn" type="submit">Entrar</button>

          <div style={{textAlign:"center"}}>
            <span>Não tem uma conta? </span>
            <Link to="/cadastro" className="link">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
