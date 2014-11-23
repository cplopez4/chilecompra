
$.getJSON( "flare.json", function( data2 ) {
       
  $(function() {
    
      //var randomNames = ['Burgis', 'Pascal', 'Lysann', 'Theo', 'Julia', 'Barnabas', 'Immanuel', 'Marisa', 'Folker', 'Hadumod', 'Friedegunde', 'Marco', 'Otto', 'Sonnhardt', 'Arntraud', 'Andree', 'Wiltrudis', 'Astrid', 'Kathrein', 'Raoul', 'Vivien', 'Ole', 'Leo', 'Dankward', 'David', 'Ferfried', 'Sonngard', 'Fabio', 'Hansjakob', 'Huberta', 'Doro', 'Gordian', 'Sturmius', 'Sturmhard', 'Reintraud', 'Sabine', 'Georg', 'Sylvia', 'Ann', 'Editha', 'Gunhard', 'Etienne', 'Hildtraud', 'Noah', 'Margarete', 'Stilla', 'Brian', 'Pauline', 'Edgar', 'Kathrin'];
      var nodeCount = 1;
      function generateRandomData(node, level) {
        if (!level) level = 1;
        var key, count = 0;
        for(key in node.children) {
            count++;
          }
        var numChildren = count; //3+Math.round(Math.random()*6);
        //node.children = [];
          var amount = node.amount;
          var name = "05.3"
        
        for (var i=0; i<numChildren; i++) {
          nodeCount ++;
            var child = { 
              taxonomy: "cofog",
              name: "05.1",
              label: node.children[i].label, 
              amount: node.children[i].amount
            }

          node.color = vis4color.fromHex("#0000ff").lightness('*'+(.5+Math.random()*.5)).x;
          //if (level == 1) child.color = vis4color.fromHSL(i/numChildren*360, .7, .5).x;
          if (level == 2|| level ==1) child.color = vis4color.fromHex(node.color).lightness('*'+(.5+Math.random()*.5)).x;
          amount -= child.amount;
          node.children.push(child);
          if (level < 3) generateRandomData(node.children[i], level+1);
        }
        return node;
      }
      
      var data = generateRandomData(data2);

      console.log(data);
      
      new BubbleTree({
        data: data,
        container: '.bubbletree'
      });
    
      
    });
                                        
});
