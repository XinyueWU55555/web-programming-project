am5.ready(function () {
    // Create root and chart
    var root = am5.Root.new("chartdiv_map");
    var chart = root.container.children.push(
        am5map.MapChart.new(root, { wheelY: "none" })
    );

    var polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow,
            exclude: ["AQ"],
            include: ["AR", "BR"],
        })
    );
    
    polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}: {worldcup} times",
        templateField: "polygonSettings"
    });

    polygonSeries.data.setAll([{
        id: "AR",
        worldcup: 2,
        polygonSettings: {
            fill: am5.color(0x43A1D5)
        }
    }, {
        id: "BR",
        worldcup: 5,
        polygonSettings: {
            fill: am5.color(0xFFDC02)
        }
    }]);

    

});