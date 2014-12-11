
$.getJSON( "jsonfinal2.json", function( data2 ) {
       
  $(function() {
    
      //var randomNames = ['Burgis', 'Pascal', 'Lysann', 'Theo', 'Julia', 'Barnabas', 'Immanuel', 'Marisa', 'Folker', 'Hadumod', 'Friedegunde', 'Marco', 'Otto', 'Sonnhardt', 'Arntraud', 'Andree', 'Wiltrudis', 'Astrid', 'Kathrein', 'Raoul', 'Vivien', 'Ole', 'Leo', 'Dankward', 'David', 'Ferfried', 'Sonngard', 'Fabio', 'Hansjakob', 'Huberta', 'Doro', 'Gordian', 'Sturmius', 'Sturmhard', 'Reintraud', 'Sabine', 'Georg', 'Sylvia', 'Ann', 'Editha', 'Gunhard', 'Etienne', 'Hildtraud', 'Noah', 'Margarete', 'Stilla', 'Brian', 'Pauline', 'Edgar', 'Kathrin'];
      function generateRandomData(node, level) {
        if (!level) level = 1;
        var key, count = 0;
        for(key in node.children) {
            count++;
          }

        var numChildren = count; //3+Math.round(Math.random()*6);
                
        for (var i=0; i<numChildren; i++) {
          
            
          node.color = vis4color.fromHex("#0000ff").lightness('*'+(.5+Math.random()*.5)).x;
          
          generateRandomData(node.children[i], level+1);
        }
        return node;
      }
      
      var data = generateRandomData(data2);

      
      new BubbleTree({
        data: data,
        container: '.bubbletree'
      });
    
      
    });
                                        
});
