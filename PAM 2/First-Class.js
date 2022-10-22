// Assigning
const Nama = ()=>{
    console.log("Zointa");
}
Nama();

// Argument

function sayHello() {
    return "Hello, ";
  }
  function greeting(helloMessage, name) {
    console.log(helloMessage() + name);
  }
  
  greeting(sayHello, "Zointa");

// Returning
function Sapa (){
    return ()=> {
        console.log("Halo semua!");
    };
}