function first() {
    console.log('Di dalam fungsi pertama');
    second();
    console.log('Di dalam fungsi pertama lagi');
  }
function second() {
    console.log('Di dalam fungsi kedua');
    }
first();
console.log('Sekarang di dalam GEC(Global Execution Context');