import "./styles.css";
import React,{useEffect,useState} from "react";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar } from "react-modern-calendar-datepicker";

const reducer = (state, action) => {
  switch(action.type) {
    case "SET_STATE": 
       return {...state, ...action.payload}
    default:
       return state
 }
};

export default function App() {
  const [state, dispatch] = React.useReducer(reducer, {
    holiday:{},
    holidayResult:[],
    loading: true
  });

  const [selectedDayRange, setSelectedDayRange] = useState({
    from: null,
    to: null
  });

  useEffect(() => {
    fetch(
      "https://www.gov.uk/bank-holidays.json")
                  .then((res) => res.json())
                  .then((json) => {
                      dispatch({type: 'SET_STATE', payload: {holiday : json}})
                  })
    dispatch({type: 'SET_STATE', payload: {loading : false}})
  },[])

  const addZeroBefore = (number) => {
    return ('0' + number).slice(-2)
  }

  const notes = (word) => {
    return word?word:"Not Specified"
  }
  const bunting = (word) => {
    return word?"true":"false"
  }

  const filterDates = () => {

    var startDate = selectedDayRange.from.year +'-'+addZeroBefore(selectedDayRange.from.month)+'-'+addZeroBefore(selectedDayRange.from.day)
    var endDate = selectedDayRange.to.year +'-'+addZeroBefore(selectedDayRange.to.month)+'-'+addZeroBefore(selectedDayRange.to.day)
    var d1 = new Date(startDate).getTime();
    var d2 = new Date(endDate).getTime();
    var places = ["england-and-wales","scotland","northern-ireland"]
    var result = []
    places.forEach(function (item, index) {
      var temp = state.holiday[item].events.filter(i => {
        var currentDate = new Date(i.date).getTime()
        return currentDate >= d1 &&
                 currentDate <= d2
      })
      if(temp.length){
        temp = temp.map(function(el) {
          var o = Object.assign({}, el);
          o.division = state.holiday[item].division;
          return o;
        })
      }
      Array.prototype.push.apply(result,temp); 
    });
    dispatch({type: 'SET_STATE', payload: {holidayResult : result}})
  }

  const style = {
    root:{paddingTop:'50px'},
    filter:{margin:'20px',color:"black",fontFamily:'monospace',borderRadius:'10px',fontSize:30,textAlign:'center', padding:'30px',cursor:'pointer',width:'inherit',backgroundColor:'wheat'},
    card:{boxShadow:'0 4px 8px 0 rgba(0,0,0,0.2)',padding:'20px',marginBottom:'20px',borderRadius:'10px'}
  }

  const result = state.loading?(<p>Loading</p>):
                  (<div style={style.root}>
                    <Calendar
                      value={selectedDayRange}
                      onChange={setSelectedDayRange}
                      shouldHighlightWeekends
                    />
                    <div style={style.filter} onClick={filterDates}>
                      filter
                    </div>
                    {state.holidayResult?state.holidayResult.map((holiday,index)=>{
                      return (
                        <div key={index} style={style.card}>
                          <p><strong>title : </strong>{ holiday.title}</p>
                          <p><strong>date : </strong>{holiday.date}</p>
                          <p><strong>notes : </strong>{notes(holiday.notes)}</p>
                          <p><strong>bunting : </strong>{bunting(holiday.bunting)}</p>
                          <p><strong>division : </strong>{holiday.division}</p>
                        </div>
                      )
                    }):(null)}
                    </div>
                  )

  return (
    <div className="App">
      {result}
    </div>
  );
}
