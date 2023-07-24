// const deleteBtn = document.querySelectorAll('.fa-trash')
// const item = document.querySelectorAll('.item span')
// const itemCompleted = document.querySelectorAll('.item span.completed')

// Array.from(deleteBtn).forEach((element)=>{
//     element.addEventListener('click', deleteItem)
// })

// Array.from(item).forEach((element)=>{
//     element.addEventListener('click', markComplete)
// })

// Array.from(itemCompleted).forEach((element)=>{
//     element.addEventListener('click', markUnComplete)
// })

// async function deleteItem(){
//     const itemText = this.parentNode.childNodes[1].innerText
//     try{
//         const response = await fetch('deleteItem', {
//             method: 'delete',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({
//               'itemFromJS': itemText
//             })
//           })
//         const data = await response.json()
//         console.log(data)
//         location.reload()

//     }catch(err){
//         console.log(err)
//     }
// }

// async function markComplete(){
//     const itemText = this.parentNode.childNodes[1].innerText
//     try{
//         const response = await fetch('markComplete', {
//             method: 'put',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({
//                 'itemFromJS': itemText
//             })
//           })
//         const data = await response.json()
//         console.log(data)
//         location.reload()

//     }catch(err){
//         console.log(err)
//     }
// }

// async function markUnComplete(){
//     const itemText = this.parentNode.childNodes[1].innerText
//     try{
//         const response = await fetch('markUnComplete', {
//             method: 'put',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({
//                 'itemFromJS': itemText
//             })
//           })
//         const data = await response.json()
//         console.log(data)
//         location.reload()

//     }catch(err){
//         console.log(err)
//     }
// }
// document.querySelector('form').addEventListener('submit', function (e) {
//     e.preventDefault();
//     const lat1 = document.getElementById('lat1').value;
//     const long1 = document.getElementById('long1').value;
//     const lat2 = document.getElementById('lat2').value;
//     const long2 = document.getElementById('long2').value;
//     const bingMapsUrl = `https://www.bing.com/maps/directions?rtp=pos.${lat1}_${long1}~pos.${lat2}_${long2}&mode=D`;
//     // window.location.href = bingMapsUrl;
//   });

function deleteAllCookies(type) {
  const cookies = document.cookie.split(";");
  console.log("inside delete cookies");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  if (type === "admin") {
    window.location.href = "/admin-login";
  } else {
    window.location.href = "/";
  }
}
