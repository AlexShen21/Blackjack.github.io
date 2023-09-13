import React from 'react';
import './style.css'
import ReactDOM from 'react-dom';
import Confetti from 'react-confetti';



  class App extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        deck: [],
        dealer: null,
        player: null,
        wallet: 0,
        inputValue: 0,
        currentBet: null,
        gameOver: true,
        message: null,
        gameStart: false,
        newDeck: '',
        doubleHide: false,
        cardCount: 0
      };
    }

    

    startGame(){
      this.setState({
        gameStart: true
      });
    }

  
    generateDeck() {
      const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A', 2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
      const suits = ['d','c','h','s'];
      const deck = [];
      for (let i = 0; i < cards.length; i++) {
        for (let j = 0; j < suits.length; j++) {
          deck.push({number: cards[i], suit: suits[j]});
        }
      }
      return deck;
    }
    
    dealCards(deck) {
      const playerCard1 = this.getRandomCard(deck);
      const dealerCard1 = this.getRandomCard(playerCard1.updatedDeck);
      const playerCard2 = this.getRandomCard(dealerCard1.updatedDeck);    
      const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
      const dealerStartingHand = [dealerCard1.randomCard, {}];
      
      const player = {
        cards: playerStartingHand,
        count: this.getCount(playerStartingHand)
      };
      const dealer = {
        cards: dealerStartingHand,
        count: this.getCount(dealerStartingHand)
      };
      
      return {updatedDeck: playerCard2.updatedDeck, player, dealer};
    }


    startNewGame(type) {
      if (type === 'PlayAgain') {
        if (this.state.wallet > 0) {
          if (this.state.deck.length < 10){
            this.setState({newDeck: "New Deck Generated"})
          }
          const deck = (this.state.deck.length < 10) ? this.generateDeck() : this.state.deck;
          const { updatedDeck, player, dealer } = this.dealCards(deck);
  
          this.setState({
            deck: updatedDeck,
            dealer,
            player,
            currentBet: 0,
            gameOver: false,
            message: null,
            doubleHide: false
          });
        }
         else {
          this.setState({ message: 'No More Money ☹️' });
        }
      } else {
        const deck = this.generateDeck();
        const { updatedDeck, player, dealer } = this.dealCards(deck);
  
        this.setState({
          deck: updatedDeck,
          dealer,
          player,
          wallet: 400,
          inputValue: 0,
          currentBet: 0,
          gameOver: false,
          message: null,
          doubleHide: false
        });
      }
    }
  
    allin(){
      this.setState({
        inputValue: this.state.wallet
      })
    }

    addBet(type){
      let bet = this.state.inputValue;
      bet += type;
      if(bet > this.state.wallet){
        return;
      }
      this.setState({
        inputValue: bet 
      })
    }
    //do reset button
    resetBet(){
      this.setState({
        inputValue: 0
      })
    }
         
    getRandomCard(deck) {
      const updatedDeck = deck;
      const randomIndex = Math.floor(Math.random() * updatedDeck.length);
      const randomCard = updatedDeck[randomIndex];
      updatedDeck.splice(randomIndex, 1);
      return { randomCard, updatedDeck };
    }
    
    placeBet() {
      const currentBet2 = this.state.inputValue;
  
      if (currentBet2 <= this.state.wallet) {
        const wallet = this.state.wallet - currentBet2;
        this.setState({ wallet, inputValue: 0, currentBet: currentBet2 });
      }

      if(this.state.player.count === 21){
        this.stand(currentBet2);
      }
      this.setState({newDeck: ""})
    }


    hit() {
      if (!this.state.gameOver) {
        if (this.state.currentBet) {
          const { randomCard, updatedDeck } = this.getRandomCard(this.state.deck);
          const player = this.state.player;
          player.cards.push(randomCard);
          player.count = this.getCount(player.cards);

          if(player.count === 21){
            this.stand(this.state.currentBet, false);
          }

          if (player.count > 21) {
            this.setState({ deck: updatedDeck, player, gameOver: true, message: 'Bust!' });
          } 
          else{
            this.setState({deck: updatedDeck, player: player, doubleHide: true})
          }
        } 
      }
    }
    
    dealerDraw(dealer, deck) {
      const { randomCard, updatedDeck } = this.getRandomCard(deck);
      dealer.cards.push(randomCard);
      dealer.count = this.getCount(dealer.cards);
      return { dealer, updatedDeck };
    }
    
    getCount(cards) {
      const rearranged = [];
      cards.forEach(card => {
        if (card.number === 'A') {
          rearranged.push(card);
        } else if (card.number) {
          rearranged.unshift(card);
        }
        
        
      });
      
      return rearranged.reduce((total, card) => {
        if (card.number === 'J' || card.number === 'Q' || card.number === 'K') {
          return total + 10;
        } else if (card.number === 'A') {
          return (total + 11 <= 21) ? total + 11 : total + 1;
        } else {
          return total + card.number;
        }
      }, 0);
    }
    
    stand(wager, double) {
      if (!this.state.gameOver) {

        const randomCard = this.getRandomCard(this.state.deck);
        let deck = randomCard.updatedDeck;
        let dealer = this.state.dealer;
        let player = this.state.player;
        dealer.cards.pop();
        dealer.cards.push(randomCard.randomCard);
        dealer.count = this.getCount(dealer.cards);

  
        // Keep drawing cards until count is 17 or more
        if ((player.count === 21 && player.cards.length === 2) && (dealer.count !== 21 || dealer.cards.length !== 2)){
          this.setState({
          wallet: this.state.wallet + wager * 1.5,
          gameOver: true,
          message: 'BlackJack!! You win! 🥳'});
          return;
        }
        if((player.count === 21 && player.cards.length === 2) && (dealer.count === 21 && dealer.cards.length === 2)){
          this.setState({
            wallet: this.state.wallet,
            gameOver: true,
            message: 'Wow! Two Blackjacks, Push :('
          });
          return;
        }
        
        while(dealer.count < 17) {
          const draw = this.dealerDraw(dealer, deck);
          dealer = draw.dealer;
          deck = draw.updatedDeck;
        }

        if (dealer.count > 21) {
          if (double === true){
            this.setState({
              wallet: this.state.wallet + wager * 2 - 100,
              gameOver: true,
              message: 'You win 🥳!'
            });
          }
          else{

          this.setState({
            wallet: this.state.wallet + wager * 2,
            gameOver: true,
            message: 'You win 🥳!'
          });
        }
        } 
        else {
          const winner = this.getWinner(dealer, this.state.player);
          let wallet = this.state.wallet;
          let message;
          
          if (winner === 'dealer') {
            message = 'Dealer wins. ☹️';
          } 
          else if (winner === 'player') {
            wallet += wager * 2;
            message = 'You win 🥳!';
          } 
          else {
            if(double === true){
              wallet +=100
            }
            wallet += this.state.currentBet;
            message = 'Push. 🙃';
          }
          if(double === true){
            this.setState({
              deck, 
              dealer,
              wallet: wallet - 100,
              gameOver: true,
              message
            });
          }
          else{
          this.setState({
            deck, 
            dealer,
            wallet,
            gameOver: true,
            message
          });}
      } 
      } 
    }
    

    double(){
      if(this.state.wallet < this.state.currentBet){
        return
      }
      let playerDup = this.state.player;
      let currentBet = this.state.currentBet
      const { randomCard, updatedDeck } = this.getRandomCard(this.state.deck);
      playerDup.cards.push(randomCard);
      let playerCount = this.getCount(playerDup.cards);
      playerDup.count = playerCount;

      this.setState({player: playerDup, deck: updatedDeck})
      
      if (this.state.player.count > 21) {
        this.setState({ gameOver: true, message: 'Bust!', currentBet: currentBet*2, wallet: this.state.wallet - currentBet });
      }
      else{
        this.setState({currentBet: currentBet*2});
        this.stand(currentBet * 2, true);}
    }



    getWinner(dealer, player) {
      if(player.count === 21 && player.cards.length === 2){
        if(dealer.count === 21 && dealer.cards.length === 2){
          return 'push'
        }
        else if(dealer.count === 21 && dealer.cards.length !== 2){
          return 'player'
        }
        else{
          return 'player'
        }

      }
      else if(dealer.count === 21 && dealer.cards.length === 2){
        return 'dealer'
      }
      else{
      if (dealer.count > player.count) {
        return 'dealer';
      } else if (dealer.count < player.count) {
        return 'player';
      } else {
        return 'push';
      }}
    }
    
    
    componentWillMount() {
      this.startNewGame();
    }


    render(){
    
    
    

      return (
  
        <div>
          <div>
            <h1 className='title'>Blackjack</h1>
            {
              this.state.message === "BlackJack!! You win! 🥳"?
              <div>
              <Confetti   width={2000}
                          height={1000}
                          numberOfPieces={200}
                          colors={['rgb(255, 0, 0)', 'rgb(255, 128, 0)' ,'rgb(255, 155, 74)', 'rgb(255, 251, 0)', 'rgb(254, 254, 124)',
                                  'rgb(0, 161, 0)','rgb(72, 255, 0)', 'rgb(0, 255, 213)', 'rgb(0, 43, 255)', 'rgb(122, 0, 255)', 'rgb(255, 0, 200)']}
                          gravity={0.2}>
                </Confetti>
              </div>

              :null
            }


            {
            !this.state.gameStart ?
            <div>
            <div className = 'StartGame'>
            <button className = 'StartGameButton' onClick={() => {this.startGame()}}> Play! </button>
            </div>
            </div>
            :null}


            { this.state.gameOver?
              <div>
            <div className='newGame'><button className = 'newGameButton' onClick={() => {this.startNewGame()}}>Start a New Game</button></div>
            <div className='playAgain'><button className = 'playAgainButton' onClick={() => {this.startNewGame('PlayAgain')}}>Keep Going</button></div>
            </div>
            :null
            }
            
            {
              !this.state.gameOver && this.state.currentBet ? 
            <p className='actions'>
              <button className = 'actionButton' onClick={() => {this.hit()}}>Hit</button>
              <button className = 'actionButton'onClick={() => {this.stand(this.state.currentBet, false)}}>Stand</button>

              {!this.state.doubleHide?
              <button className = 'actionButton'onClick={() => {this.double()}}>Double</button>
              : null
              }
  
  
            </p>
            : null
            }
          </div>
          
          <div>
            {
            !this.state.gameOver && !this.state.currentBet && this.state.gameStart?
            <div>
            <div className = 'bet1'>
              <button className = 'betMoney1' onClick={() => {this.addBet(1)}}> $1 </button>
            </div>
            <div className = 'bet5'> 
              <button className = 'betMoney5' onClick={() => {this.addBet(5)}}> $5 </button>
            </div>

            <div className = 'bet10'>
              <button className = 'betMoney10' onClick={() => {this.addBet(20)}}> $20 </button>
            </div>
            <div className = 'bet20'>
              <button className = 'betMoney20' onClick={() => {this.addBet(100)}}> $100 </button>
            </div>
            <div className = 'all'>
              <button className = 'allIn' onClick = {() => {this.allin()}}> All In! </button>
            </div>

            <div className = 'placeBet'>
              <button className = 'placeBetButton' onClick={() => {this.placeBet(this.state.currentBet)}}> Place Bet </button>
              <button className = 'resetButton' onClick= {() => {this.resetBet()}}> Reset Bet </button>
            </div>
            
            </div>
            : null
            }
            
  
          </div>

          <h1 className = "message"> {this.state.message}</h1>
          <h1 className = "message2"> {this.state.newDeck}</h1>
  
          {
            this.state.gameStart ?
          <div>
          <div className = 'Wallet'>Bank: ${ this.state.wallet }</div>
          <div className = 'currBet'>Input Bet: ${ this.state.inputValue }</div>
          <div className = 'wagered'>Money Wagered: ${ this.state.currentBet }</div>
          </div>
          : null}
          
        { this.state.currentBet ? 
          <div>
          <h1 className = "yourCards"> Your Cards: {this.state.player.count}</h1>
          <div className = "cardsPos">
          <table className="cards">
            <tr>
              { this.state.player.cards.map((card, i) => {
                return <Card key={i} number={card.number} suit={card.suit}/>
              }) }
            </tr>
          </table>
          </div>
          <h1 className = "dealerWords"> Dealer's Cards: {this.state.dealer.count}</h1>
          <table className="dealercards">
            <tr>
              { this.state.dealer.cards.map((card, i) => {
                return <Card key={i} number={card.number} suit={card.suit}/>;
              }) }
            </tr>
          </table>
          </div>
          :null}
          
      
      </div>
      )
      }

      
    }

      
    const cards = {
        '2d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2_of_diamonds.svg/165px-2_of_diamonds.svg.png',
        '2c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/2_of_clubs.svg/165px-2_of_clubs.svg.png',
        '2h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/2_of_hearts.svg/165px-2_of_hearts.svg.png',
        '2s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2_of_spades.svg/165px-2_of_spades.svg.png',
        '3d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/3_of_diamonds.svg/165px-3_of_diamonds.svg.png',
        '3c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/3_of_clubs.svg/165px-3_of_clubs.svg.png',
        '3h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/3_of_hearts.svg/165px-3_of_hearts.svg.png',
        '3s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/3_of_spades.svg/165px-3_of_spades.svg.png',
        '4d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/4_of_diamonds.svg/165px-4_of_diamonds.svg.png',
        '4c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/4_of_clubs.svg/165px-4_of_clubs.svg.png',
        '4h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/4_of_hearts.svg/165px-4_of_hearts.svg.png',
        '4s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/4_of_spades.svg/165px-4_of_spades.svg.png',
        '5d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/5_of_diamonds.svg/165px-5_of_diamonds.svg.png',
        '5c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/5_of_clubs.svg/165px-5_of_clubs.svg.png',
        '5h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/5_of_hearts.svg/165px-5_of_hearts.svg.png',
        '5s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/5_of_spades.svg/165px-5_of_spades.svg.png',
        '6d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/6_of_diamonds.svg/165px-6_of_diamonds.svg.png',
        '6c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/6_of_clubs.svg/165px-6_of_clubs.svg.png',
        '6h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/6_of_hearts.svg/165px-6_of_hearts.svg.png',
        '6s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/6_of_spades.svg/165px-6_of_spades.svg.png',
        '7d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/7_of_diamonds.svg/165px-7_of_diamonds.svg.png',
        '7c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/7_of_clubs.svg/165px-7_of_clubs.svg.png',
        '7h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/7_of_hearts.svg/165px-7_of_hearts.svg.png',
        '7s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/7_of_spades.svg/165px-7_of_spades.svg.png',
        '8d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/8_of_diamonds.svg/165px-8_of_diamonds.svg.png',
        '8c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/8_of_clubs.svg/165px-8_of_clubs.svg.png',
        '8h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/8_of_hearts.svg/165px-8_of_hearts.svg.png',
        '8s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/8_of_spades.svg/165px-8_of_spades.svg.png',
        '9d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/9_of_diamonds.svg/165px-9_of_diamonds.svg.png',
        '9c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/9_of_clubs.svg/165px-9_of_clubs.svg.png',
        '9h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/9_of_hearts.svg/165px-9_of_hearts.svg.png',
        '9s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/9_of_spades.svg/165px-9_of_spades.svg.png',
        '10d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/10_of_diamonds.svg/165px-10_of_diamonds.svg.png',
        '10c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/10_of_clubs.svg/165px-10_of_clubs.svg.png',
        '10h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/10_of_hearts.svg/165px-10_of_hearts.svg.png',
        '10s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/10_of_spades.svg/165px-10_of_spades.svg.png',
        'Jd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Jack_of_diamonds2.svg/165px-Jack_of_diamonds2.svg.png',
        'Jc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jack_of_clubs2.svg/165px-Jack_of_clubs2.svg.png',
        'Jh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Jack_of_hearts2.svg/165px-Jack_of_hearts2.svg.png',
        'Js': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Jack_of_spades2.svg/165px-Jack_of_spades2.svg.png',
        'Qd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Queen_of_diamonds2.svg/165px-Queen_of_diamonds2.svg.png',
        'Qc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Queen_of_clubs2.svg/165px-Queen_of_clubs2.svg.png',
        'Qh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Queen_of_hearts2.svg/165px-Queen_of_hearts2.svg.png',
        'Qs': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Queen_of_spades2.svg/165px-Queen_of_spades2.svg.png',
        'Kd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/King_of_diamonds2.svg/165px-King_of_diamonds2.svg.png',
        'Kc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/King_of_clubs2.svg/165px-King_of_clubs2.svg.png',
        'Kh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/King_of_hearts2.svg/165px-King_of_hearts2.svg.png',
        'Ks': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/King_of_spades2.svg/165px-King_of_spades2.svg.png',
        'Ad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Ace_of_diamonds.svg/165px-Ace_of_diamonds.svg.png',
        'Ac': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Ace_of_clubs.svg/165px-Ace_of_clubs.svg.png',
        'Ah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Ace_of_hearts.svg/165px-Ace_of_hearts.svg.png',
        'As': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ace_of_spades.svg/165px-Ace_of_spades.svg.png',

      };


    const Card = ({ number, suit }) => {
      const combo = (number) ? `${number}${suit}` : null;
      
      return (
        <td>
          <div className= 'card'>
            { <img src = {cards[combo]} alt = ""/> } 
            
          </div>
        </td>
      );
    };




ReactDOM.render(<App />, document.getElementById('root'));