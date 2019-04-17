QUnit.test('Network Graph', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'networkgraph'
        }
    });
    var point;

    assert.notStrictEqual(
        chart.container.querySelector('.highcharts-no-data'),
        null,
        'No-data label should display when there is no data (#9801)'
    );

    chart.addSeries({
        layoutAlgorithm: {
            enableSimulation: false
        },
        keys: ['from', 'to'],
        data: [
            ['A', 'B'],
            ['A', 'C'],
            ['A', 'D'],

            ['B', 'A'],
            ['B', 'C'],

            ['C', 'D'],

            ['D', 'A']
        ],
        nodes: [
            {
                id: 'D',
                color: '#FF0000'
            }
        ]
    });

    assert.strictEqual(
        chart.series[0].points.length,
        7,
        'Series successfully added'
    );

    assert.strictEqual(
        chart.container.querySelector('.highcharts-no-data'),
        null,
        'No-data label should NOT display when there is data (#9801)'
    );

    chart.addSeries({
        keys: ['from', 'to', 'width', 'color', 'dashStyle'],
        data: [
            ['1', '2'],
            ['2', '1', '2', '#FF0000', 'dot'],
            ['3', '1']
        ]
    });

    assert.ok(true, 'No errors in cyclical graphs (#9803)');

    assert.strictEqual(
        chart.series[0].nodes[3].graphic.element
            .getAttribute('fill')
            .toUpperCase(),
        '#FF0000',
        'Custom series.nodes.color is correct'
    );

    point = chart.series[1].points[1];

    assert.strictEqual(
        point.graphic.element.getAttribute('stroke').toUpperCase(),
        '#FF0000',
        'Custom series.data.color is correct (#9798)'
    );

    assert.strictEqual(
        point.graphic.element.getAttribute('stroke-width'),
        '2',
        'Custom series.data.width is correct (#9798)'
    );

    assert.strictEqual(
        point.graphic.element.getAttribute('stroke-dasharray'),
        '2,6',
        'Custom series.data.dashStyle is correct (#9798)'
    );

    chart.series[1].setData([['XX', 'XY']]);

    assert.strictEqual(
        chart.series[1].nodes.length,
        2,
        'Correct number of nodes (#10163)'
    );

    chart.series[1].update({
        dataLabels: {
            enabled: true
        }
    });

    chart.series[1].update({});

    assert.ok(
        true,
        'No errors after series update when dataLabels were enabled'
    );

    var rSeries = chart.addSeries({
        keys: ['from', 'to'],
        data: [
            ['1.0', '2.0'],
            ['2.0', '3.0'],
            ['3.0', '4.0'],
            ['4.0', '1.0']
        ]
    });
    // debugger;
    rSeries.nodes[0].remove();

    assert.strictEqual(
        rSeries.nodes.length,
        3,
        'Removed node = 1.0'
    );

    assert.strictEqual(
        rSeries.points.filter(link => link.from !== '1.0' && link.to !== '1.0').length,
        2,
        'Removed all links for node = 1.0'
    );


});
