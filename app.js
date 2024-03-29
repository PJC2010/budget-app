//BUDGET CONTROLLER
let budgetController = (function(){

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100)

        }else{
            this.percentage = -1
        }
        

    };

    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum; 
    }


    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    };

    return {
        addItem: function(type, des, val){
            let newItem, ID;
            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id+1;
            }else {
                ID = 0;
            }
            
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val)
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val)
            }
            //push it into our data structure
            data.allItems[type].push(newItem)

            //Return new item
            return newItem;
            

        },

        deleteItem: function(type, id){
            let ids, index;
            // id = 3
            //data.allItems[type][id]
            //ids = [1 2 4 6 8]
            //index = 3

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },


        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');


            //calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp


            //calculate the percentage of income that we spent 
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100)

            }else{
                data.percentage = -1
            }

            //Expense 100 and income 200, spent 50% = 100/200 = 0.5 * 100 = 50

        },

        calculatePercentages: function(){
            /**
             * a= 20
             * b= 10
             * c= 40
             * income = 100
             *  a=20/100=20%
             * b= 10/100=10%
             * c=40/100=40%
             */

             data.allItems.exp.forEach(function(cur){
                 cur.calcPercentage(data.totals.inc)
             })
        },

        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc

        },


        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
    }
   
})();


//UI CONTROLLER
let UIController = (function(){

    let DOMstrings ={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formatNumber = function(num, type){
        var numSplit, int, dec, type;
        /**
         *  plus or minus before the number
         * exactly 2 decimal points
         * comma separating the thousands
         * 2310.4567 -> + 2310.46
         * 2000 -> + 2,000.00
         * 
         */

         num = Math.abs(num);
         num = num.toFixed(2);

         numSplit = num.split('.');

         int = numSplit[0];

         if(int.length > 3){
             int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);//input 2310, output 2,310

         }

         dec = numSplit[1];

         return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec
    };

    let nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    }

    return {
        getInput: function(){

            return {
            type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
            
        },
        addListItem: function(obj, type){
            let html, newHTML, element;
            // Create HTML string with placeholder text

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            


            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID){
            let el =  document.getElementById(selectorID)
            el.parentNode.removeChild(el)
            
        },

        clearFields: function(){
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }



        },

        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';

                }else {
                    current.textContent = '---'
                }
                
            })


        },
        displayMonth: function(){
            let now, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth()
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function(){

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMstrings.inputButton).classList.toggle('red')

        },

        

        getDOMstrings: function(){
            return DOMstrings;
        }
    }

})()

//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){

    let setupEventListeners = function(){
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem()
                
            }
    
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)

    };

    let updateBudget = function(){
        // 1. Calculate the budget 
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the user interface
        UICtrl.displayBudget(budget)

    };

    let updatePercentages = function(){
        //1, Calculate percentages
        budgetCtrl.calculatePercentages()

        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages()

        //Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };


    let ctrlAddItem = function(){
        let input, newItem;
        
        //1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        //2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value)

        //3. Add the new item to the user interface

        UICtrl.addListItem(newItem, input.type);

        //4. Clear fields
        UICtrl.clearFields()

        //5. Calculate and update budget
        updateBudget()

        }

        //6 Calculate and update percentages
        updatePercentages()



        

    };

    let ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID =  parseInt(splitID[1]);

            //1. Delete item from the data structure 

            budgetCtrl.deleteItem(type, ID);
            //2. Delete the item from the user interface
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
            //4. Calculate and update percentages
            updatePercentages();


        }

    }

    return{
        init: function(){
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }




})(budgetController, UIController)

controller.init();