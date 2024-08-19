am5.ready(function () {

    // Create root and chart
    var root = am5.Root.new("chartdiv_hk");
    var chart = root.container.children.push(
        am5map.MapChart.new(root, { wheelY: "none" })
    );

    var polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_hongKongHigh,
            valueField: "value",
            calculateAggregates: true
        })
    );

    // Title
    var title = chart.children.push(am5.Label.new(root, {
        text: "Abuse cases A&E attendance by District\n(per 100,000 population)",
        fontSize: 20,
        y: 20,
        x: am5.percent(20),
        centerX: am5.p50,
        background: am5.Rectangle.new(root, {
            fill: am5.color(0xffffff),
            fillOpacity: 0.5
        })
    }));

    polygonSeries.data.setAll([
        { id: "HK-YT", value: 17.1 },
        { id: "HK-YL", value: 42.6 },
        { id: "HK-WT", value: 20.1 },
        { id: "HK-WC", value: 18.7 },
        { id: "HK-TW", value: 14.9 },
        { id: "HK-TP", value: 16.3 },
        { id: "HK-TM", value: 38.3 },
        { id: "HK-ST", value: 14.1 },
        { id: "HK-SS", value: 21.3 },
        { id: "HK-SO", value: 22.0 },
        { id: "HK-SK", value: 17.8 },
        { id: "HK-NO", value: 17.6 },
        { id: "HK-KU", value: 15.9 },
        { id: "HK-KI", value: 23.3 },
        { id: "HK-KC", value: 17.5 },
        { id: "HK-IS", value: 21.0 },
        { id: "HK-EA", value: 18.2 },
        { id: "HK-CW", value: 14.5 }
    ]);

    polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}: {value} cases"
    });

    polygonSeries.set("heatRules", [{
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color(0xdedede),
        max: am5.color(0x880000),
        key: "fill"
    }]);

    polygonSeries.mapPolygons.template.states.create("hover", {
        fill: root.interfaceColors.get("primaryButtonHover")
    });
})