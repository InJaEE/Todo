<script>
import { setValue, setTodo } from '../store';

// function getInputValue(){
//     if(!inputValue){
//         alert('Please enter the value!');
//         return;
//     }
//     const storageObj = {inputValue, 'complete': false};
//     setTodo.insert(storageObj);
//     inputValue = '';
// };

function handleInsert(){
    if($setValue){
        const todoObj = {
            inputValue: $setValue,
            complete: false,
        }
        setTodo.insert(todoObj);
        setValue.keyup('');
    } else{
        alert('Please enter the todo!');
    };
}

function handleKeyup(e){
    setValue.keyup(e.target.value);
    if(e.keyCode === 13){
        handleInsert();
    }
}
</script>

<input type="text" value={$setValue} on:keyup={handleKeyup} autofocus>
<button on:click={handleInsert}>ADD</button>