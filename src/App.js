import React,{useState,useEffect} from 'react'
import web3 from './web3'
import Lottery from './Lottery';


function App() {
  console.log(web3);
 web3.eth.getAccounts().then(console.log);

  const [manager,setManager] = useState('');
  const [players,setPlayers] = useState([]);
  const [balance,setBalance] = useState(0);
  const [tempNumber,setTempNumber] = useState(0);
  const [tempNumberErr,setTempNumberErr] = useState('');
  const [displayMessage,setDisplayMessage] = useState('');
  const [loading,setLoading] = useState(false);
  const [isManager,setIsManager] = useState(false);


  const [winner,setWinner] = useState('');

  useEffect(()=>{

    fetchDatas();
    

  },[]);

  const fetchDatas = async()=>{

    let tempManager = await Lottery.methods.manager().call();
    let tempPlayers = await Lottery.methods.getPlayers().call();
    let tempBalance = await web3.eth.getBalance(Lottery.options.address);

    const accounts = await web3.eth.getAccounts();

    if(accounts[0]===tempManager){
      setIsManager(true);
    }

    setManager(tempManager);
    setPlayers(tempPlayers);
    setBalance(tempBalance);

  }

  const validateAndSubmit = async()=>{
    let tempError = '';
    const accounts = await web3.eth.getAccounts();

    //We are assuming, the first account sets the ether value...

    if(tempNumber<0.01){
        tempError="Ether must be more than 0.01";
    }

    if(tempError){
      setTempNumberErr(tempError);
    }
    else{
      setDisplayMessage('Entering the lottery...')
      setLoading(true);
      await Lottery.methods.entry().send({
        from:accounts[0],
        value:web3.utils.toWei(tempNumber,'ether')
      }).then(res=>{
        console.log(res);
        setDisplayMessage("Entered the lottery");
        setTempNumberErr('');
        setWinner('');
        setTempNumber(0);
        fetchDatas();
      }).catch(err=>{
        console.log(err);
        setDisplayMessage("Error Occurred....... Couldnt enter the lottery")
      });

     
      setLoading(false);
    }

  }


  const getWinner = async(accounts)=>{
    let data = await Lottery.methods.winner().call({
      from:accounts[0]
    });
    return data;
  }


  const pickWinnerFunction = async()=>{
    setLoading(true);
    const accounts = await web3.eth.getAccounts();
    await Lottery.methods.pickWinner().send({
      from:accounts[0]
    }).then(async(res)=>{
      console.log('picked');
      let tempWinner = await getWinner(accounts);
      console.log(tempWinner);
      setWinner(tempWinner);
    }).catch(err=>{

    });

    setLoading(false);

  }

  return (
   
    <div style={{padding:"2rem"}}>
      <h2>Lottery Contract</h2>
      <p>This contract is maintained by {manager && manager}. He will be responsible for picking up the winner. </p>
      <p>There are total {players && players.length} people competing for the prize pool of '{balance && web3.utils.fromWei(balance,'ether')  }' Ether. </p>
    <br/>
    <h3>
      Want to try your luck?
    </h3>
    Amount of Ether to enter : <input value={tempNumber} onChange={(e)=>setTempNumber(e.target.value)} type="number" placeholder="Enter value in ether"/>
     
    {
      tempNumberErr &&
      <div style={{color:'red'}}>
        {tempNumberErr}
      </div>
      
    }
    <br/>
     <button disabled={loading} onClick={validateAndSubmit} style={{padding:"0.25rem 0.75rem", cursor:"pointer",margin:"1rem 0"}}>
      Enter
    </button> 
    {
      <div>

     { displayMessage && displayMessage}
      </div>
    }
{
  isManager &&
    <div style={{marginTop:"2rem"}}>
      <h3>Time to pick up a winner?</h3>
      <button disabled={loading}
      onClick = {pickWinnerFunction}
       style={{padding:"0.25rem 0.75rem", cursor:"pointer",margin:"0.25rem 0 0.5rem 0"}} onClick = {pickWinnerFunction}>
      Pick Winner
    </button>

    <p>{winner && `!!! ${winner} Has won the lottery !!!` }</p>

    </div>
}
    
    
    </div>
  
  
  )
}

export default App
